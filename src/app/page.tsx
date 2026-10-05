'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  REFERENCE_ITEMS,
  REFERENCE_RATE_INPUTS,
  REFERENCE_PANEL_INPUTS,
  REFERENCE_NORMS,
  deriveRates,
  derivePanelRates,
  costItem,
  type RateInputs,
  type PanelRateInputs,
  type BomInput,
} from '@bom/engine';

import { supabase } from '@/lib/supabase';
import { I18nProvider, useTranslation } from '@/lib/i18n';
import WorkspaceSidebar, { type WorkspaceView } from '@/components/WorkspaceSidebar';
import ProjectDashboard, { type ProjectDashboardItem } from '@/components/ProjectDashboard';
import EditableBOMTable from '@/components/EditableBOMTable';
import BOMSummary from '@/components/BOMSummary';
import ExcelActions from '@/components/ExcelActions';
import RateCockpit, { formatIDR } from '@/components/RateCockpit';
import CloudSyncModal from '@/components/CloudSyncModal';
import RevisionModal from '@/components/RevisionModal';
import CreateItemModal from '@/components/CreateItemModal';

function mapDbRowToBomInput(row: any): BomInput {
  return {
    header: {
      item_code: row.item_code,
      item_name: row.item_name,
      project_qty: row.project_qty || 1,
      overall_l: row.overall_l,
      overall_w: row.overall_w,
      overall_h: row.overall_h,
      finish_recipe: row.finish_recipe || 'NC NATURAL',
      photo_url: row.custom_columns?.photo_url,
      drawing_link: row.custom_columns?.dwg_link,
      spec_link: row.custom_columns?.spec_link,
      notes: row.custom_columns?.notes,
    },
    solid: (row.solid_components || []).map((s: any, idx: number) => ({
      line_no: s.line_no || idx + 1,
      component: s.component,
      material: s.material || 'TEAK',
      l: s.l,
      w: s.w,
      t: s.t,
      qty: s.qty,
      exposed: s.exposed || 'Y',
      curved: s.curved || 'N',
    })),
    panels: (row.panel_components || []).map((p: any, idx: number) => ({
      line_no: p.line_no || idx + 1,
      component: p.component,
      panel_type: p.panel_type || 'PLY-12-RAW',
      l: p.l,
      w: p.w,
      t: p.t,
      qty: p.qty,
      exposed_faces: p.exposed_faces ?? 1,
    })),
    hardware: (row.hardware_components || []).map((h: any, idx: number) => ({
      line_no: h.line_no || idx + 1,
      item_code: h.item_code || `HW-${idx + 1}`,
      description: h.description,
      qty: h.qty || 1,
      uom: h.uom || 'pcs',
      unit_price: h.unit_price || 0,
    })),
    boxes: (row.box_components || []).map((b: any, idx: number) => ({
      box_no: b.box_no || idx + 1,
      contents: b.contents,
      l: b.l,
      w: b.w,
      h: b.h,
      qty: b.qty || 1,
    })),
  };
}

function WorkspaceApp() {
  const { language, setLanguage, t } = useTranslation();

  // Navigation & View States
  const [currentView, setCurrentView] = useState<WorkspaceView>('all');
  const [viewMode, setViewMode] = useState<'project' | 'item'>('project');
  const [selectedItemIdx, setSelectedItemIdx] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals State
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [isCloudOpen, setIsCloudOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);

  // Rate Inputs State
  const [rateInputs, setRateInputs] = useState<RateInputs>({ ...REFERENCE_RATE_INPUTS });
  const [panelRateInputs, setPanelRateInputs] = useState<PanelRateInputs>({ ...REFERENCE_PANEL_INPUTS });

  // Items State (defaults to reference fixtures, hydrated from Supabase)
  const [dbItems, setDbItems] = useState<ProjectDashboardItem[]>([]);
  const [items, setItems] = useState<BomInput[]>(() => {
    return REFERENCE_ITEMS.map((item) => JSON.parse(JSON.stringify(item.input)));
  });

  // Revision & Lock State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [rev1Snapshot, setRev1Snapshot] = useState<any>(null);

  // Load 40 live items from Supabase on mount
  useEffect(() => {
    async function fetchSupabaseItems() {
      try {
        const { data, error } = await supabase
          .from('bom_items')
          .select('*')
          .order('item_code', { ascending: true });

        if (!error && data && data.length > 0) {
          setDbItems(data as ProjectDashboardItem[]);
          const mapped = data.map(mapDbRowToBomInput);
          setItems(mapped);
        }
      } catch (err) {
        console.warn('Using local fallback items:', err);
      }
    }
    fetchSupabaseItems();
  }, []);

  // 1. Reactive Derived Rates
  const derivedRates = useMemo(() => {
    return deriveRates(rateInputs);
  }, [rateInputs]);

  const derivedPanelRates = useMemo(() => {
    return derivePanelRates(panelRateInputs);
  }, [panelRateInputs]);

  const activeRates = useMemo(() => {
    return {
      ...derivedRates,
      ...derivedPanelRates,
    };
  }, [derivedRates, derivedPanelRates]);

  // 2. Active Item & Cost Calculation
  const currentItem = items[selectedItemIdx] || items[0];

  const { costResult, hasPartialWarning } = useMemo(() => {
    if (!currentItem) return { costResult: null, hasPartialWarning: false };

    let isPartial = false;
    const sanitizedItem: BomInput = {
      ...currentItem,
      hardware: (currentItem.hardware || []).map((h) => {
        if (h.unit_price === null || h.unit_price === undefined || isNaN(h.unit_price)) {
          isPartial = true;
          return { ...h, unit_price: 0 };
        }
        return h;
      }),
    };

    try {
      const res = costItem(sanitizedItem, activeRates, REFERENCE_NORMS);
      return { costResult: res, hasPartialWarning: isPartial };
    } catch (err) {
      console.error('Calculation error for item:', currentItem.header?.item_code, err);
      return { costResult: null, hasPartialWarning: true };
    }
  }, [currentItem, activeRates]);

  // 3. Batch counts for sidebar badges
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: dbItems.length || items.length,
      ov: 0,
      bv: 0,
      mirrors: 0,
      seating: 0,
      tables: 0,
      millwork: 0,
      cushions: 0,
    };

    const targetList = dbItems.length > 0 ? dbItems : (items as any);
    for (const it of targetList) {
      const code = (it.item_code || it.header?.item_code || '').toUpperCase();
      const name = (it.item_name || it.header?.item_name || '').toUpperCase();
      const rooms = it.custom_columns?.room_distribution;

      if ((rooms?.ov || 0) > 0) res.ov++;
      if ((rooms?.bv || 0) > 0) res.bv++;

      if (
        name.includes('MIRROR') ||
        name.includes('CERMIN') ||
        code.includes('AA-02') ||
        code.includes('AA-03') ||
        code.includes('AA-04') ||
        code.includes('AA-07') ||
        code.includes('AA-29')
      ) {
        res.mirrors++;
      } else if (
        name.includes('CHAIR') ||
        name.includes('STOOL') ||
        name.includes('BENCH') ||
        code.includes('SG-01') ||
        code.includes('SG-26') ||
        code.includes('SG-27')
      ) {
        res.seating++;
      } else if (
        name.includes('TABLE') ||
        name.includes('VANITY') ||
        name.includes('SHELF') ||
        code.includes('TB-02') ||
        code.includes('TB-03') ||
        code.includes('OV-501') ||
        code.includes('OV-505')
      ) {
        res.tables++;
      } else if (
        name.includes('DOOR') ||
        name.includes('KUSEN') ||
        name.includes('COVER') ||
        name.includes('PARTITION') ||
        code.includes('ID-OV') ||
        code.includes('ID-BV')
      ) {
        res.millwork++;
      } else if (
        name.includes('CUSHION') ||
        name.includes('BUSA') ||
        name.includes('KAIN') ||
        code.includes('AA-09') ||
        code.includes('AA-10') ||
        code.includes('AA-11') ||
        code.includes('AA-12')
      ) {
        res.cushions++;
      }
    }

    return res;
  }, [dbItems, items]);

  // Rate batch update handler
  const handleRateBatchUpdate = (newRates: Partial<RateInputs>, newPanelRates: Partial<PanelRateInputs>) => {
    setRateInputs((prev) => ({ ...prev, ...newRates }));
    setPanelRateInputs((prev) => ({ ...prev, ...newPanelRates }));
  };

  // Lock BOM handler
  const handleToggleLock = () => {
    if (!isLocked) {
      setIsLocked(true);
      setRev1Snapshot({
        rates: { ...activeRates },
        costResult: costResult ? JSON.parse(JSON.stringify(costResult)) : null,
      });
    } else {
      setIsLocked(false);
      setRev1Snapshot(null);
    }
  };

  const effectiveCostResult = isLocked && rev1Snapshot?.costResult ? rev1Snapshot.costResult : costResult;

  // View selection from sidebar
  const handleSelectView = (view: WorkspaceView) => {
    setCurrentView(view);
    setViewMode('project');
  };

  // Select item from project table
  const handleSelectItem = (itemCode: string) => {
    const idx = items.findIndex((it) => it.header?.item_code === itemCode);
    if (idx !== -1) {
      setSelectedItemIdx(idx);
    }
    setViewMode('item');
  };

  // Interactive line edit handler
  const handleItemUpdate = (updatedItem: BomInput) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[selectedItemIdx] = updatedItem;
      return copy;
    });

    setDbItems((prev) => {
      return prev.map((dbIt) => {
        if (dbIt.item_code === updatedItem.header?.item_code) {
          return {
            ...dbIt,
            item_name: updatedItem.header?.item_name || dbIt.item_name,
            project_qty: updatedItem.header?.project_qty || dbIt.project_qty,
            overall_l: updatedItem.header?.overall_l,
            overall_w: updatedItem.header?.overall_w,
            overall_h: updatedItem.header?.overall_h,
            solid_components: updatedItem.solid,
            panel_components: updatedItem.panels,
            hardware_components: updatedItem.hardware,
            box_components: updatedItem.boxes,
          };
        }
        return dbIt;
      });
    });
  };

  // Save item changes to Supabase
  const handleSaveItemToDb = async () => {
    if (!currentItem || !currentItem.header?.item_code) return;
    const code = currentItem.header.item_code;
    const unitHpp = Math.round(effectiveCostResult?.unit_cost || 0);
    const targetMargin = 30;
    const sellingPrice = Math.round(unitHpp / (1 - targetMargin / 100));

    const payload = {
      item_code: code,
      item_name: currentItem.header.item_name || 'Furniture Model',
      project_qty: currentItem.header.project_qty || 1,
      overall_l: currentItem.header.overall_l,
      overall_w: currentItem.header.overall_w,
      overall_h: currentItem.header.overall_h,
      finish_recipe: currentItem.header.finish_recipe || 'NC NATURAL',
      unit_hpp: unitHpp,
      selling_price: sellingPrice,
      solid_components: currentItem.solid || [],
      panel_components: currentItem.panels || [],
      hardware_components: currentItem.hardware || [],
      box_components: currentItem.boxes || [],
      locked_snapshot: effectiveCostResult ? { costResult: effectiveCostResult } : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('bom_items')
      .upsert(payload, { onConflict: 'item_code' });

    if (error) {
      console.error('Failed to save to Supabase:', error);
      throw error;
    }

    setDbItems((prev) =>
      prev.map((it) => (it.item_code === code ? { ...it, ...payload } : it))
    );
  };

  // Delete item from Supabase and State
  const handleDeleteItem = async () => {
    if (!currentItem || !currentItem.header?.item_code) return;
    const code = currentItem.header.item_code;
    const confirmDelete = window.confirm(
      language === 'id'
        ? `Apakah Anda yakin ingin menghapus item ${code} dari database?`
        : `Are you sure you want to permanently delete item ${code} from database?`
    );
    if (!confirmDelete) return;

    try {
      await supabase.from('bom_items').delete().eq('item_code', code);
      setItems((prev) => prev.filter((it) => it.header?.item_code !== code));
      setDbItems((prev) => prev.filter((it) => it.item_code !== code));
      setSelectedItemIdx(0);
      setViewMode('project');
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item.');
    }
  };

  // Create new item handler
  const handleCreateItem = async (newItem: BomInput, batchTag: string) => {
    const code = newItem.header?.item_code || 'NEW-01';
    const unitHpp = 0;
    const sellingPrice = 0;

    const payload = {
      item_code: code,
      item_name: newItem.header?.item_name || 'New Model',
      project_qty: newItem.header?.project_qty || 1,
      overall_l: newItem.header?.overall_l,
      overall_w: newItem.header?.overall_w,
      overall_h: newItem.header?.overall_h,
      finish_recipe: newItem.header?.finish_recipe || 'NC NATURAL',
      unit_hpp: unitHpp,
      selling_price: sellingPrice,
      solid_components: newItem.solid || [],
      panel_components: newItem.panels || [],
      hardware_components: newItem.hardware || [],
      box_components: newItem.boxes || [],
      custom_columns: {
        photo_url: newItem.header?.photo_url,
        dwg_link: newItem.header?.drawing_link,
        notes: `Batch: ${batchTag}`,
        room_distribution: {
          ov: 0,
          bv: 0,
          total: newItem.header?.project_qty || 1,
        },
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('bom_items').insert(payload);
    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    setItems((prev) => [...prev, newItem]);
    setDbItems((prev) => [...prev, payload as any]);
    setSelectedItemIdx(items.length);
    setViewMode('item');
  };

  // Download template
  const handleDownloadStandardTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/PLV_BOM_Standard_Template.xlsx';
    link.download = 'PLV_BOM_Standard_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const existingBatchesList = [
    'Overwater Villa (OV)',
    'Beach Villa (BV)',
    'Mirrors & Glasswork',
    'Chairs & Stools',
    'Tables & Vanities',
    'Doors & Millwork',
    'Cushions & Fabric',
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0D1117] text-neutral-200 font-sans">
      {/* NOTION-STYLE SIDEBAR */}
      <WorkspaceSidebar
        currentView={currentView}
        onSelectView={handleSelectView}
        counts={counts}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenCloudSync={() => setIsCloudOpen(true)}
        onDownloadTemplate={handleDownloadStandardTemplate}
      />

      {/* MAIN CANVAS AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* TOP WORKSPACE NAV BAR */}
        <header className="h-12 border-b border-border-subtle bg-[#14181F]/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Toggle Sidebar"
            >
              <span className="material-symbols-outlined text-[19px]">
                {isSidebarOpen ? 'format_indent_decrease' : 'format_indent_increase'}
              </span>
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
              <span className="text-white font-medium">PLV Costing</span>
              <span>/</span>
              {viewMode === 'item' ? (
                <>
                  <button
                    onClick={() => setViewMode('project')}
                    className="hover:text-white transition-colors underline decoration-dotted"
                  >
                    Batches
                  </button>
                  <span>/</span>
                  <span className="text-accent-blue font-semibold">{currentItem.header?.item_code}</span>
                </>
              ) : (
                <span className="text-neutral-200">
                  {currentView === 'rates' ? t('masterRates') : t('workspace')}
                </span>
              )}
            </div>
          </div>

          {/* Right Tools: New Item, Language Switcher, Revision Lock */}
          <div className="flex items-center gap-2.5">
            {/* New Item Button */}
            <button
              onClick={() => setIsCreateItemOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue hover:bg-sky-400 text-black font-semibold text-xs transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>New Item</span>
            </button>

            {/* EN / ID Language Switcher Pill */}
            <div className="flex items-center bg-surface-elevated p-0.5 rounded border border-border-subtle text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded font-mono font-semibold text-[11px] transition-all ${
                  language === 'en' ? 'bg-accent-blue text-black' : 'text-neutral-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-2 py-0.5 rounded font-mono font-semibold text-[11px] transition-all ${
                  language === 'id' ? 'bg-accent-blue text-black' : 'text-neutral-400 hover:text-white'
                }`}
                title="Ganti ke Bahasa Indonesia"
              >
                ID
              </button>
            </div>

            {/* Revision Lock Button */}
            <button
              onClick={() => setIsRevisionOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-elevated hover:bg-neutral-800 border border-border-subtle text-[11px] font-mono text-neutral-300 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[14px] text-accent-green">
                {isLocked ? 'lock' : 'difference'}
              </span>
              <span className="hidden sm:inline">{isLocked ? t('locked') : t('unlocked')}</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CANVAS CONTENT */}
        <main className="flex-1 overflow-y-auto custom-scroll p-4 lg:p-6 flex flex-col gap-6 max-w-[1700px] w-full mx-auto">
          {viewMode === 'item' ? (
            /* ITEM DETAIL BREAKDOWN VIEW WITH INTERACTIVE EDITING & DELETE */
            <div className="flex flex-col gap-6">
              {/* Back to Project Banner & Actions */}
              <div className="flex items-center justify-between bg-surface-card border border-border-subtle p-3 rounded-xl">
                <button
                  onClick={() => setViewMode('project')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-accent-blue hover:text-black border border-border-subtle text-xs font-semibold text-neutral-200 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>{t('backToProject')}</span>
                </button>

                <div className="flex items-center gap-3">
                  {/* Model Selector Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-mono">{t('code')}:</span>
                    <select
                      value={selectedItemIdx}
                      onChange={(e) => setSelectedItemIdx(Number(e.target.value))}
                      className="bg-surface-elevated border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:border-border-strong"
                    >
                      {items.map((it, idx) => (
                        <option key={idx} value={idx}>
                          {it.header?.item_code} - {it.header?.item_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delete Item Button */}
                  <button
                    onClick={handleDeleteItem}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs transition-colors"
                    title="Delete this model"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete_forever</span>
                    <span className="hidden sm:inline">Delete Item</span>
                  </button>
                </div>
              </div>

              {/* Top Item Summary with Photo & HPP */}
              <BOMSummary
                costResult={effectiveCostResult}
                projectQty={currentItem.header?.project_qty || 1}
                itemName={currentItem.header?.item_name || 'Furniture Model'}
                itemCode={currentItem.header?.item_code || 'ITEM-01'}
                hasPartialWarning={hasPartialWarning}
                ohPct={derivedRates.OH_PCT !== undefined ? derivedRates.OH_PCT * 100 : undefined}
                photoUrl={currentItem.header?.photo_url}
                dwgLink={currentItem.header?.drawing_link}
                specLink={currentItem.header?.spec_link}
                notes={currentItem.header?.notes}
              />

              {/* Editable Component Cutlist Tables with Live Recalculation */}
              <EditableBOMTable
                bomItem={currentItem}
                costResult={effectiveCostResult}
                onChange={handleItemUpdate}
                onSaveToDatabase={handleSaveItemToDb}
                isLocked={isLocked}
              />
            </div>
          ) : currentView === 'rates' ? (
            /* MASTER RATES COCKPIT WITH DYNAMIC PARAMETER CRUD */
            <RateCockpit
              rateInputs={rateInputs}
              panelRateInputs={panelRateInputs}
              onRateInputsChange={setRateInputs}
              onPanelRateInputsChange={setPanelRateInputs}
              derivedRates={derivedRates}
              derivedPanelRates={derivedPanelRates}
              isLocked={isLocked}
            />
          ) : (
            /* PROJECT & BATCH DASHBOARD VIEW */
            <ProjectDashboard
              items={dbItems.length > 0 ? dbItems : (items as any)}
              currentView={currentView}
              onSelectItem={handleSelectItem}
              onDownloadTemplate={handleDownloadStandardTemplate}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <CreateItemModal
        isOpen={isCreateItemOpen}
        onClose={() => setIsCreateItemOpen(false)}
        onCreate={handleCreateItem}
        existingBatches={existingBatchesList}
      />
      <CloudSyncModal isOpen={isCloudOpen} onClose={() => setIsCloudOpen(false)} />
      <RevisionModal
        isOpen={isRevisionOpen}
        onClose={() => setIsRevisionOpen(false)}
        isLocked={isLocked}
        onToggleLock={handleToggleLock}
        rev1Snapshot={rev1Snapshot?.costResult || rev1Snapshot}
        currentHPP={effectiveCostResult?.unit_cost || 0}
      />
    </div>
  );
}

export default function BOMCostingDashboard() {
  return (
    <I18nProvider>
      <WorkspaceApp />
    </I18nProvider>
  );
}
