const fs = require('fs');
const engine = require('../engine.js');

const SUPABASE_URL = 'https://bjkjahetvxnimchkunqp.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa2phaGV0dnhuaW1jaGt1bnFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAyNTM3NiwiZXhwIjoyMTA2NjAxMzc2fQ.EQ3-lgaVS95tsAgDbEDCgf9w7jWV8r-MHXoaZunTYqE';

const rateInputs = JSON.parse(fs.readFileSync('fixtures/rate-inputs-2026-09-29.json'));
const panelRateInputs = JSON.parse(fs.readFileSync('fixtures/panel-rate-inputs-2026-09-29.json'));
const norms = JSON.parse(fs.readFileSync('fixtures/norms-2026-09-30.json'));

const derivedRates = engine.deriveRates(rateInputs);
const derivedPanelRates = engine.derivePanelRates(panelRateInputs);
const activeRates = { ...derivedRates, ...derivedPanelRates };

const items = JSON.parse(fs.readFileSync('extracted_items.json'));
console.log(`Processing and costing ${items.length} items...`);

async function run() {
  const preparedRecords = [];

  for (const item of items) {
    // Prepare BomInput for engine
    const bomInput = {
      header: {
        item_code: item.item_code,
        item_name: item.item_name,
        project_qty: item.project_qty,
        overall_l: item.overall_l,
        overall_w: item.overall_w,
        overall_h: item.overall_h,
        finish_recipe: item.finish_recipe,
        photo_url: item.custom_columns?.photo_url,
        drawing_link: item.custom_columns?.dwg_link,
        spec_link: item.custom_columns?.spec_link,
        notes: item.custom_columns?.notes
      },
      solid: item.solid_components.map(s => ({
        component: s.component,
        material: s.material || 'TEAK',
        l: s.l,
        w: s.w,
        t: s.t,
        qty: s.qty,
        exposed: s.exposed || 'Y',
        curved: s.curved || 'N'
      })),
      panels: item.panel_components.map(p => ({
        component: p.component,
        panel_type: p.panel_type || 'PLY-12-RAW',
        l: p.l,
        w: p.w,
        t: p.t,
        qty: p.qty,
        exposed_faces: p.exposed_faces || 1
      })),
      hardware: item.hardware_components.map(h => ({
        item_code: h.item_code,
        description: h.description,
        qty: h.qty || 1,
        unit_price: h.unit_price || 0
      })),
      boxes: item.box_components.map(b => ({
        box_no: b.box_no,
        contents: b.contents,
        l: b.l,
        w: b.w,
        h: b.h,
        qty: b.qty || 1
      }))
    };

    let costResult = null;
    let unitHpp = 0;

    try {
      costResult = engine.costItem(bomInput, activeRates, norms);
      unitHpp = Math.round(costResult.unit_cost || 0);
    } catch (err) {
      console.warn(`Engine warning for ${item.item_code}:`, err.message);
    }

    // Add custom subcon/upholstery costs if present
    const subconTotal = (item.custom_components || []).reduce((acc, c) => acc + (c.cost || 0), 0);
    if (subconTotal > 0) {
      unitHpp += Math.round(subconTotal);
    }

    const targetMargin = item.target_margin || 30;
    const sellingPrice = Math.round(unitHpp / (1 - (targetMargin / 100)));

    const record = {
      item_code: item.item_code,
      item_name: item.item_name,
      project_qty: item.project_qty,
      overall_l: item.overall_l,
      overall_w: item.overall_w,
      overall_h: item.overall_h,
      finish_recipe: item.finish_recipe,
      status: 'DRAFT',
      version: 1,
      target_margin: targetMargin,
      unit_hpp: unitHpp,
      selling_price: sellingPrice,
      solid_components: item.solid_components,
      panel_components: item.panel_components,
      hardware_components: item.hardware_components,
      custom_components: item.custom_components,
      box_components: item.box_components,
      custom_columns: item.custom_columns,
      locked_snapshot: costResult ? { costResult } : null,
      updated_at: new Date().toISOString()
    };

    preparedRecords.push(record);
  }

  console.log(`Ready to upsert ${preparedRecords.length} records to Supabase bom_items.`);

  // Upsert in batches of 10 to avoid payload size limit
  const batchSize = 10;
  for (let i = 0; i < preparedRecords.length; i += batchSize) {
    const batch = preparedRecords.slice(i, i + batchSize);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bom_items`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Error upserting batch ${i / batchSize + 1}:`, res.status, errText);
    } else {
      console.log(`Successfully upserted batch ${i / batchSize + 1} (${batch.length} items)`);
    }
  }

  console.log('All 39 items calculated and upserted to Supabase!');
}

run().catch(console.error);
