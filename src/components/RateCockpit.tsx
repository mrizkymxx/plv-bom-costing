'use client';

import React from 'react';
import type { RateInputs, PanelRateInputs } from '@bom/engine';

interface RateCockpitProps {
  rateInputs: RateInputs;
  panelRateInputs: PanelRateInputs;
  onRateInputsChange: (newInputs: RateInputs) => void;
  onPanelRateInputsChange: (newPanelInputs: PanelRateInputs) => void;
  derivedRates: Record<string, number>;
  derivedPanelRates: Record<string, number>;
  isLocked?: boolean;
}

export function formatIDR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}

export default function RateCockpit({
  rateInputs,
  panelRateInputs,
  onRateInputsChange,
  onPanelRateInputsChange,
  derivedRates,
  derivedPanelRates,
  isLocked = false,
}: RateCockpitProps) {
  const handleRateNumChange = (key: keyof RateInputs, value: string) => {
    if (isLocked) return;
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
    // Guard against zero / negative division on rate divisors
    if ((key === 'comp_m3' || key === 'stmv_direct' || key === 'fin_m2') && num <= 0) {
      num = 0.0001;
    }
    onRateInputsChange({
      ...rateInputs,
      [key]: num,
    });
  };

  const handlePlyChange = (thickness: number, value: string) => {
    if (isLocked) return;
    const num = parseFloat(value) || 0;
    onPanelRateInputsChange({
      ...panelRateInputs,
      ply: {
        ...panelRateInputs.ply,
        [thickness]: num,
      },
    });
  };

  const labCarp = derivedRates.LAB_CARP ?? ((rateInputs.carp_pool * (1 - rateInputs.carp_deduct)) / (rateInputs.comp_m3 || 1));
  const ohPct = derivedRates.OH_PCT !== undefined ? (derivedRates.OH_PCT * 100) : ((rateInputs.oh_pool / (rateInputs.stmv_direct || 1)) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Rate Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-card border border-border-subtle">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-blue text-[20px]">tune</span>
            Rate Card Cockpit (27 Keputusan Terkunci)
          </h2>
          <p className="text-xs text-text-subtle mt-0.5">
            Tarif dasar pabrik terpusat untuk kayu solid, panel, finishing flat 6-sisi, dan overhead pool 12.99%.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-surface-elevated px-3 py-1.5 rounded-lg border border-border-subtle">
          <span className="text-text-muted">Overhead:</span>
          <span className="text-accent-amber font-semibold">{ohPct.toFixed(4)}%</span>
        </div>
      </div>

      {/* 4 MODULAR BOXES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BOX 1: SOLID TIMBER & CARPENTRY */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-green text-[18px]">forest</span>
              <h3 className="font-semibold text-sm text-white">Box 1: Solid Timber & Carpentry</h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-accent-green-bg text-accent-green px-2 py-0.5 rounded border border-accent-green/20">
              Q1 - Q5
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-text-subtle block mb-1">Harga Log Jati (/m³):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.log_teak}
                onChange={(e) => handleRateNumChange('log_teak', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-text-subtle block mb-1">Harga Log Mindi (/m³):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.log_mindi}
                onChange={(e) => handleRateNumChange('log_mindi', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-text-subtle block mb-1">Ongkos Sawmill / Processing (/m³):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.processing}
                onChange={(e) => handleRateNumChange('processing', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-text-subtle block mb-1">Pool Upah Tukang (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.carp_pool}
                onChange={(e) => handleRateNumChange('carp_pool', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Derived Outputs Box 1 */}
          <div className="bg-surface-elevated rounded-lg p-3 border border-border-subtle flex flex-col gap-2 mt-2">
            <span className="text-[11px] font-medium text-text-subtle">Kalkulasi Turunan Tier Kayu (/m³):</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between bg-surface-card p-2 rounded border border-border-subtle">
                <span className="text-text-muted">Upah Tukang/m³:</span>
                <span className="text-white font-semibold">{formatIDR(labCarp)}</span>
              </div>
              <div className="flex justify-between bg-surface-card p-2 rounded border border-border-subtle">
                <span className="text-text-muted">Jati Tier A:</span>
                <span className="text-white font-semibold">{formatIDR(derivedRates['TEAK_A'])}</span>
              </div>
              <div className="flex justify-between bg-surface-card p-2 rounded border border-border-subtle">
                <span className="text-text-muted">Jati Tier B:</span>
                <span className="text-white font-semibold">{formatIDR(derivedRates['TEAK_B'])}</span>
              </div>
              <div className="flex justify-between bg-surface-card p-2 rounded border border-border-subtle">
                <span className="text-text-muted">Subkon (No Lab):</span>
                <span className="text-accent-blue font-semibold">{formatIDR(derivedRates['TEAK_A_NO_LAB'] || ((rateInputs.log_teak + rateInputs.processing) * rateInputs.yield_A))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOX 2: PANEL & SHEET MATERIAL */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-amber text-[18px]">layers</span>
              <h3 className="font-semibold text-sm text-white">Box 2: Panel & Sheet Material</h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-accent-amber-bg text-accent-amber px-2 py-0.5 rounded border border-accent-amber/20">
              Q8 - Q14
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {[3, 6, 9, 12, 15, 18].map((t) => (
              <div key={t}>
                <label className="text-text-subtle block mb-1">Ply {t}mm /lbr:</label>
                <input
                  type="number"
                  disabled={isLocked}
                  value={panelRateInputs.ply[t] || 0}
                  onChange={(e) => handlePlyChange(t, e.target.value)}
                  className="w-full bg-surface-elevated border border-border-subtle rounded px-2.5 py-1 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            ))}
          </div>

          <div className="bg-surface-elevated rounded-lg p-3 border border-border-subtle flex flex-col gap-2 mt-auto">
            <span className="text-[11px] font-medium text-text-subtle">Tarif Panel Jadi (/m² Bersih):</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between bg-surface-card p-2 rounded border border-border-subtle">
                <span className="text-text-muted">Ply 18mm MSF:</span>
                <span className="text-white font-semibold">{formatIDR(derivedPanelRates['PLY-18-MSF'] || 178225)}</span>
              </div>
              <div className="flex justify-between bg-surface-card p-2 rounded border border-border-subtle">
                <span className="text-text-muted">Ply 18mm TSF:</span>
                <span className="text-white font-semibold">{formatIDR(derivedPanelRates['PLY-18-TSF'] || 236450)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOX 3: FINISHING FLAT RATE (6 SISI) */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-blue text-[18px]">format_paint</span>
              <h3 className="font-semibold text-sm text-white">Box 3: Finishing Flat Rate (6 Sisi)</h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-accent-blue-bg text-accent-blue px-2 py-0.5 rounded border border-accent-blue/20">
              Q2, Q6, Q7
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-text-subtle block mb-1">Total Cat/Thinner (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.paint_total}
                onChange={(e) => handleRateNumChange('paint_total', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-text-subtle block mb-1">Total Amplas (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.abrasive_total}
                onChange={(e) => handleRateNumChange('abrasive_total', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-text-subtle block mb-1">Pool Upah Finishing (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.fin_pool}
                onChange={(e) => handleRateNumChange('fin_pool', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-text-subtle block mb-1">Luas Semprot Acuan (m²):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.fin_m2}
                onChange={(e) => handleRateNumChange('fin_m2', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="bg-surface-elevated rounded-lg p-3 border border-border-subtle flex justify-between items-center text-xs mt-auto">
            <span className="text-text-subtle font-medium">Total Rate Flat Finishing (FIN_ALL /m²):</span>
            <span className="text-accent-blue font-mono font-bold text-sm">
              {formatIDR(derivedRates['FIN_ALL'])}
            </span>
          </div>
        </div>

        {/* BOX 4: PACKING, MISC & OVERHEAD */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-rose text-[18px]">inventory</span>
              <h3 className="font-semibold text-sm text-white">Box 4: Packing & Overhead</h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-accent-rose-bg text-accent-rose px-2 py-0.5 rounded border border-accent-rose/20">
              Q4, Q21
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-text-subtle block mb-1">Bahan Karton Box (/m²):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.carton_m2}
                onChange={(e) => handleRateNumChange('carton_m2', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-text-subtle block mb-1">Upah Packing (/m³):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.pack_lab}
                onChange={(e) => handleRateNumChange('pack_lab', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-text-subtle block mb-1">Pool Biaya Overhead (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.oh_pool}
                onChange={(e) => handleRateNumChange('oh_pool', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-text-subtle block mb-1">Direct Cost Pool (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.stmv_direct}
                onChange={(e) => handleRateNumChange('stmv_direct', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="bg-surface-elevated rounded-lg p-3 border border-border-subtle flex justify-between items-center text-xs mt-auto">
            <span className="text-text-subtle font-medium">Status Penguncian Evin (OH):</span>
            <span className="text-accent-amber font-mono font-semibold">{ohPct.toFixed(4)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
