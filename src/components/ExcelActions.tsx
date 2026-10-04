'use client';

import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import type { RateInputs, PanelRateInputs, CostResult } from '@bom/engine';

interface ExcelActionsProps {
  rateInputs: RateInputs;
  panelRateInputs: PanelRateInputs;
  onRateInputsBatchUpdate: (rates: Partial<RateInputs>, panelRates: Partial<PanelRateInputs>) => void;
  currentBOM: any;
  costResult: CostResult | null;
}

export default function ExcelActions({
  rateInputs,
  panelRateInputs,
  onRateInputsBatchUpdate,
  currentBOM,
  costResult,
}: ExcelActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export Excel Live Formulas or Static Values
  const handleExportExcel = (mode: 'formula' | 'static') => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const ohMultiplier = rateInputs.stmv_direct > 0 ? (rateInputs.oh_pool / rateInputs.stmv_direct) : 0.1299287;
    const ohPctLabel = (ohMultiplier * 100).toFixed(4);
    const summaryData = [
      ['PLV BOM COSTING EXPORT', ''],
      ['Item Code', currentBOM?.header?.item_code || 'ITEM-01'],
      ['Item Name', currentBOM?.header?.item_name || 'Custom Furniture'],
      ['Project Qty', currentBOM?.header?.project_qty || 1],
      ['Date Export', new Date().toISOString().split('T')[0]],
      ['', ''],
      ['COST BREAKDOWN', 'NOMINAL (IDR)'],
      ['Biaya Kayu Solid', costResult?.timber || 0],
      ['Biaya Fasteners', costResult?.fasteners || 0],
      ['Biaya Panel Sheet', costResult?.panels_cost || 0],
      ['Biaya Finishing', costResult?.finishing || 0],
      ['Biaya Hardware', costResult?.hardware_cost || 0],
      ['Biaya Packing', costResult?.packing || 0],
      ['Direct Cost (Subtotal)', mode === 'formula' ? { t: 'n', f: 'SUM(B8:B13)' } : (costResult?.direct || 0)],
      ['Biaya Tak Terduga (Misc 2%)', mode === 'formula' ? { t: 'n', f: 'B14*0.02' } : (costResult?.misc || 0)],
      [`Factory Overhead (${ohPctLabel}%)`, mode === 'formula' ? { t: 'n', f: `(B14+B15)*${ohMultiplier.toFixed(7)}` } : (costResult?.overhead || 0)],
      ['TOTAL HPP PER UNIT', mode === 'formula' ? { t: 'n', f: 'B14+B15+B16' } : (costResult?.unit_cost || 0)],
      ['TOTAL PROYEK', mode === 'formula' ? { t: 'n', f: 'B4*B17' } : (costResult?.project_total || 0)],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

    // Solid Wood Sheet
    const solidData = [
      ['#', 'Komponen', 'Material', 'P (mm)', 'L (mm)', 'T (mm)', 'Qty', 'Vol (m³)', 'Status', 'Biaya Kayu'],
    ];
    (currentBOM?.solid || []).forEach((l: any, i: number) => {
      const res = costResult?.solid?.[i];
      solidData.push([
        l.line_no || i + 1,
        l.component || '',
        l.material || 'TEAK',
        l.l || 0,
        l.w || 0,
        l.t || 0,
        l.qty || 1,
        res?.vol_m3 || (((l.l || 0) * (l.w || 0) * (l.t || 0) * (l.qty || 1)) / 1e9),
        res?.check || 'OK',
        res?.cost || 0,
      ]);
    });
    const wsSolid = XLSX.utils.aoa_to_sheet(solidData);
    XLSX.utils.book_append_sheet(wb, wsSolid, 'Solid Wood');

    // Panel Sheet
    const panelData = [
      ['#', 'Komponen', 'Tipe Panel', 'P (mm)', 'L (mm)', 'T (mm)', 'Qty', 'Muka', 'Lembar Dihitung', 'Status', 'Biaya Panel'],
    ];
    (currentBOM?.panels || []).forEach((p: any, i: number) => {
      const res = costResult?.panels?.[i];
      panelData.push([
        p.line_no || i + 1,
        p.component || '',
        p.panel_type || 'PLYWOOD',
        p.l || 0,
        p.w || 0,
        p.t || 0,
        p.qty || 1,
        p.exposed_faces ?? 1,
        res?.sheets_charged || 0,
        res?.check || 'OK',
        res?.cost || 0,
      ]);
    });
    const wsPanel = XLSX.utils.aoa_to_sheet(panelData);
    XLSX.utils.book_append_sheet(wb, wsPanel, 'Panels');

    // Hardware Sheet
    const hwData = [
      ['Kode', 'Deskripsi', 'Vendor', 'Qty', 'UoM', 'Harga Satuan', 'Subtotal'],
    ];
    (currentBOM?.hardware || []).forEach((h: any, i: number) => {
      hwData.push([
        h.item_code || `HW-${i+1}`,
        h.description || '',
        h.vendor || '',
        h.qty || 1,
        h.uom || 'pcs',
        h.unit_price || 0,
        (h.qty || 1) * (h.unit_price || 0),
      ]);
    });
    const wsHw = XLSX.utils.aoa_to_sheet(hwData);
    XLSX.utils.book_append_sheet(wb, wsHw, 'Hardware');

    // Packing Sheet
    const packingData = [
      ['Box #', 'Isi / Konten', 'P (mm)', 'L (mm)', 'T (mm)', 'Qty Box', 'Karton (m²)', 'Vol (m³)'],
    ];
    const boxesList = Array.isArray(costResult?.boxes) ? costResult.boxes : (currentBOM?.boxes || []);
    boxesList.forEach((b: any, i: number) => {
      packingData.push([
        b.box_no || i + 1,
        b.contents || `Box ${i + 1}`,
        b.carton_l || (b.l ? b.l + 40 : 0),
        b.carton_w || (b.w ? b.w + 40 : 0),
        b.carton_h || (b.h ? b.h + 40 : 0),
        b.qty || 1,
        b.m2 || 0,
        b.m3 || 0,
      ]);
    });
    const wsPacking = XLSX.utils.aoa_to_sheet(packingData);
    XLSX.utils.book_append_sheet(wb, wsPacking, 'Packing');

    const filename = `PLV_BOM_${currentBOM?.header?.item_code || 'Export'}_${mode}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // 2. Download Rate Template
  const handleDownloadRateTemplate = () => {
    const wb = XLSX.utils.book_new();
    const rateData = [
      ['KODE PARAMETER', 'DESKRIPSI PARAMETER', 'NILAI (IDR / ANGKA)'],
      ['log_teak', 'Harga Log Jati per m3', rateInputs.log_teak],
      ['log_mindi', 'Harga Log Mindi per m3', rateInputs.log_mindi],
      ['meranti_sawn', 'Harga Meranti Sawn per m3', rateInputs.meranti_sawn ?? 6800000],
      ['processing', 'Ongkos Sawmill/Processing per m3', rateInputs.processing],
      ['carp_pool', 'Pool Upah Tukang IDR', rateInputs.carp_pool],
      ['carp_deduct', 'Pengurang Panel Cutting Fraction', rateInputs.carp_deduct ?? 0.08],
      ['comp_m3', 'Volume Kayu Komponen Jadi m3', rateInputs.comp_m3],
      ['yield_A', 'Rendemen Tier A', rateInputs.yield_A ?? 2.8],
      ['yield_AC', 'Rendemen Tier A-Curved', rateInputs.yield_AC ?? 3.4],
      ['yield_B', 'Rendemen Tier B', rateInputs.yield_B ?? 2.2],
      ['yield_C', 'Rendemen Tier C', rateInputs.yield_C ?? 1.8],
      ['yield_D', 'Rendemen Tier D', rateInputs.yield_D ?? 1.5],
      ['yield_MER', 'Rendemen Meranti Sawn', rateInputs.yield_MER ?? 1.4],
      ['fast_total', 'Total Sekrup/Lem/Dowels IDR', rateInputs.fast_total ?? 12500000],
      ['paint_total', 'Total Cat & Thinner IDR', rateInputs.paint_total],
      ['abrasive_total', 'Total Amplas IDR', rateInputs.abrasive_total],
      ['fin_pool', 'Pool Upah Finishing IDR', rateInputs.fin_pool],
      ['sand_pool', 'Pool Upah Sanding IDR', rateInputs.sand_pool ?? 35000000],
      ['sand_keep', 'Share Sanding Kept Fraction', rateInputs.sand_keep ?? 0.8],
      ['fin_m2', 'Luas Semprot Acuan m2', rateInputs.fin_m2],
      ['oh_pool', 'Pool Overhead IDR', rateInputs.oh_pool],
      ['stmv_direct', 'Direct Cost Pool IDR', rateInputs.stmv_direct],
      ['carton_m2', 'Bahan Karton Box per m2', rateInputs.carton_m2],
      ['pack_lab', 'Upah Packing per m3', rateInputs.pack_lab],
      ['grp_a', 'Harga Karton Group A Min IDR', rateInputs.grp_a ?? 24000],
      ['misc_pct', 'Persentase Misc (2%)', rateInputs.misc_pct ?? 0.02],
      ['usd_idr', 'Kurs USD to IDR', rateInputs.usd_idr ?? 15600],
      ['ply_24', 'Plywood 24mm per lembar', panelRateInputs.ply[24] || 245000],
      ['ply_18', 'Plywood 18mm per lembar', panelRateInputs.ply[18] || 182000],
      ['ply_15', 'Plywood 15mm per lembar', panelRateInputs.ply[15] || 155000],
      ['ply_12', 'Plywood 12mm per lembar', panelRateInputs.ply[12] || 130000],
      ['ply_9', 'Plywood 9mm per lembar', panelRateInputs.ply[9] || 104000],
      ['ply_6', 'Plywood 6mm per lembar', panelRateInputs.ply[6] || 78000],
      ['ply_3', 'Plywood 3mm per lembar', panelRateInputs.ply[3] || 56000],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rateData);
    XLSX.utils.book_append_sheet(wb, ws, 'RateCard');
    XLSX.writeFile(wb, 'rates_template.xlsx');
  };

  // 3. Upload & Batch Update Rates from Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

        const updatedRates: Partial<RateInputs> = {};
        const updatedPanelRates: Partial<PanelRateInputs> = {};

        json.forEach((row: any) => {
          if (!row || row.length < 3) return;
          const code = String(row[0]).trim();
          const val = parseFloat(row[2]);
          if (isNaN(val)) return;

          if (code in rateInputs) {
            (updatedRates as any)[code] = val;
          } else if (code.startsWith('ply_')) {
            const thickness = parseInt(code.replace('ply_', ''), 10);
            if (!isNaN(thickness)) {
              if (!updatedPanelRates.ply) {
                updatedPanelRates.ply = { ...panelRateInputs.ply };
              }
              updatedPanelRates.ply[thickness] = val;
            }
          }
        });

        onRateInputsBatchUpdate(updatedRates, updatedPanelRates);
        alert(`Berhasil memperbarui tarif dasar dari Excel.`);
      } catch (err: any) {
        alert('Gagal membaca file Excel template: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Hidden file input for batch upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Download Template */}
      <button
        onClick={handleDownloadRateTemplate}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-xs text-text-subtle hover:text-white transition-all"
      >
        <span className="material-symbols-outlined text-[16px] text-accent-blue">download</span>
        <span>Download Template</span>
      </button>

      {/* Upload Batch Excel */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-xs text-text-subtle hover:text-white transition-all"
      >
        <span className="material-symbols-outlined text-[16px] text-accent-amber">upload_file</span>
        <span>Upload Batch Excel</span>
      </button>

      {/* Export Live Formulas */}
      <button
        onClick={() => handleExportExcel('formula')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-xs text-accent-green hover:text-white transition-all"
      >
        <span className="material-symbols-outlined text-[16px]">functions</span>
        <span>Export Live Formulas</span>
      </button>

      {/* Export Static Values */}
      <button
        onClick={() => handleExportExcel('static')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-xs text-text-subtle hover:text-white transition-all"
      >
        <span className="material-symbols-outlined text-[16px]">table_view</span>
        <span>Export Nilai Bersih</span>
      </button>
    </div>
  );
}
