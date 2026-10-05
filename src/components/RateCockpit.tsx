'use client';

import React, { useState } from 'react';
import type { RateInputs, PanelRateInputs } from '@bom/engine';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();
  const [customParams, setCustomParams] = useState<Array<{ key: string; name: string; value: number }>>([
    { key: 'CUSTOM_LABOR_EXT', name: 'Outside Specialized Turning', value: 35000 },
    { key: 'CRATE_WOOD_M3', name: 'Open Crate Hardwood per m³', value: 4500000 },
  ]);
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState(0);

  const handleRateNumChange = (key: keyof RateInputs, value: string) => {
    if (isLocked) return;
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
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

  const handleAddCustomParam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newName.trim()) return;
    setCustomParams((prev) => [
      ...prev,
      { key: newKey.trim().toUpperCase(), name: newName.trim(), value: newValue || 0 },
    ]);
    setNewKey('');
    setNewName('');
    setNewValue(0);
  };

  const handleDeleteCustomParam = (index: number) => {
    setCustomParams((prev) => prev.filter((_, idx) => idx !== index));
  };

  const labCarp =
    derivedRates.LAB_CARP ??
    (rateInputs.carp_pool * (1 - (rateInputs.carp_deduct || 0.1))) / (rateInputs.comp_m3 || 1);
  const ohPct =
    derivedRates.OH_PCT !== undefined
      ? derivedRates.OH_PCT * 100
      : (rateInputs.oh_pool / (rateInputs.stmv_direct || 1)) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Rate Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-strong flex items-center justify-center text-accent-yellow">
            <span className="material-symbols-outlined text-[24px]">tune</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {t('masterRates')} (27 Blueprint Decisions)
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Centralized factory rates for solid timber logs, plywood sheets, finishing pools, and 12.99% factory overhead.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-[#14181F] px-3.5 py-2 rounded-xl border border-border-subtle">
          <span className="text-text-muted">{t('overhead')}:</span>
          <span className="text-accent-yellow font-bold text-sm">{ohPct.toFixed(2)}%</span>
        </div>
      </div>

      {/* 4 PRIMARY MODULAR RATE GROUPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GROUP 1: SOLID TIMBER & CARPENTRY */}
        <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-green text-[20px]">forest</span>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                Group 1: Solid Timber & Carpentry
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-accent-green-bg text-accent-green px-2 py-0.5 rounded border border-accent-green/20">
              Q1 - Q5
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Teak Log Price (/m³):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.log_teak}
                onChange={(e) => handleRateNumChange('log_teak', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Mindi Log Price (/m³):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.log_mindi}
                onChange={(e) => handleRateNumChange('log_mindi', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Sawmill / Processing (/m³):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.processing}
                onChange={(e) => handleRateNumChange('processing', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Carpentry Payroll Pool (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.carp_pool}
                onChange={(e) => handleRateNumChange('carp_pool', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
          </div>

          {/* Derived Outputs */}
          <div className="bg-surface-elevated rounded-xl p-3.5 border border-border-subtle flex flex-col gap-2 mt-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Derived Timber Rates (/m³):</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between bg-surface-card p-2 rounded-lg border border-border-subtle">
                <span className="text-text-muted">Labor / m³:</span>
                <span className="text-white font-semibold">{formatIDR(labCarp)}</span>
              </div>
              <div className="flex justify-between bg-surface-card p-2 rounded-lg border border-border-subtle">
                <span className="text-text-muted">Teak Tier A:</span>
                <span className="text-accent-yellow font-semibold">{formatIDR(derivedRates['TEAK_A'])}</span>
              </div>
              <div className="flex justify-between bg-surface-card p-2 rounded-lg border border-border-subtle">
                <span className="text-text-muted">Teak Tier B:</span>
                <span className="text-white font-semibold">{formatIDR(derivedRates['TEAK_B'])}</span>
              </div>
              <div className="flex justify-between bg-surface-card p-2 rounded-lg border border-border-subtle">
                <span className="text-text-muted">Mindi Tier A:</span>
                <span className="text-accent-green font-semibold">{formatIDR(derivedRates['MINDI_A'])}</span>
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 2: PANEL & PLYWOOD SHEETS */}
        <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-blue text-[20px]">layers</span>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                Group 2: Panel & Plywood Sheets
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-accent-blue/15 text-accent-blue px-2 py-0.5 rounded border border-accent-blue/20">
              Raw Sheet Prices
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            {[3, 6, 9, 12, 15, 18, 24].map((t) => (
              <div key={t}>
                <label className="text-text-muted text-[11px] block mb-1">Ply {t}mm /sheet:</label>
                <input
                  type="number"
                  disabled={isLocked}
                  value={panelRateInputs.ply[t] || 0}
                  onChange={(e) => handlePlyChange(t, e.target.value)}
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          <div className="bg-surface-elevated rounded-xl p-3.5 border border-border-subtle flex flex-col gap-2 mt-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Sample Veneered Rates:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between bg-surface-card p-2 rounded-lg border border-border-subtle">
                <span className="text-text-muted">18mm Teak 2-Face:</span>
                <span className="text-white font-semibold">{formatIDR(derivedPanelRates['PLY-18-TDF'])}</span>
              </div>
              <div className="flex justify-between bg-surface-card p-2 rounded-lg border border-border-subtle">
                <span className="text-text-muted">12mm Teak 2-Face:</span>
                <span className="text-white font-semibold">{formatIDR(derivedPanelRates['PLY-12-TDF'])}</span>
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 3: FINISHING MATERIALS & LABOR */}
        <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-[20px]">format_paint</span>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                Group 3: Finishing Materials & Labor
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded border border-purple-800/40">
              4-Layer Breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Finishing Materials (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.paint_total}
                onChange={(e) => handleRateNumChange('paint_total', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Abrasives Pool (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.abrasive_total}
                onChange={(e) => handleRateNumChange('abrasive_total', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Finishing Payroll Pool:</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.fin_pool}
                onChange={(e) => handleRateNumChange('fin_pool', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Spray Area Denominator (m²):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.fin_m2}
                onChange={(e) => handleRateNumChange('fin_m2', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
          </div>

          <div className="bg-surface-elevated rounded-xl p-3 border border-border-subtle flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">Total Flat Finishing Rate (/m²):</span>
            <span className="text-accent-yellow font-bold text-sm">
              {formatIDR(derivedRates['FIN_ALL'] || 179871)}
            </span>
          </div>
        </div>

        {/* GROUP 4: PACKAGING & OVERHEAD */}
        <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">package_2</span>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                Group 4: Packaging & Factory Overhead
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
              Logistics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Carton Sheet Rate (/m²):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.carton_m2}
                onChange={(e) => handleRateNumChange('carton_m2', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Packing Labor (/m³):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.pack_lab}
                onChange={(e) => handleRateNumChange('pack_lab', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Factory Overhead Pool (IDR):</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.oh_pool}
                onChange={(e) => handleRateNumChange('oh_pool', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Direct Cost Denominator:</label>
              <input
                type="number"
                disabled={isLocked}
                value={rateInputs.stmv_direct}
                onChange={(e) => handleRateNumChange('stmv_direct', e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono focus:border-border-strong disabled:opacity-50"
              />
            </div>
          </div>

          <div className="bg-surface-elevated rounded-xl p-3 border border-border-subtle flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">Calculated Factory Overhead %:</span>
            <span className="text-accent-yellow font-bold text-sm">{ohPct.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC CUSTOM RATE PARAMETERS SECTION */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-blue text-[20px]">add_circle</span>
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
              Dynamic Custom Parameters & Rates
            </h3>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Add custom fees, subcontractor tariffs, or specific premiums
          </span>
        </div>

        {/* Existing Custom Parameters Table */}
        <div className="w-full overflow-x-auto custom-scroll">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted bg-surface-elevated/20 text-[11px] uppercase">
                <th className="py-2.5 px-3">Parameter Code</th>
                <th className="py-2.5 px-4">Description / Purpose</th>
                <th className="py-2.5 px-4 text-right">Value (IDR)</th>
                <th className="py-2.5 px-2 text-center w-14">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-[11px]">
              {customParams.map((p, idx) => (
                <tr key={idx} className="hover:bg-surface-elevated/40">
                  <td className="py-2.5 px-3 font-bold text-accent-blue">{p.key}</td>
                  <td className="py-2.5 px-4 font-sans text-neutral-200">{p.name}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-white">{formatIDR(p.value)}</td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      onClick={() => handleDeleteCustomParam(idx)}
                      className="p-1 text-text-muted hover:text-red-400 transition-colors"
                      title="Delete parameter"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Custom Parameter Form */}
        <form onSubmit={handleAddCustomParam} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-border-subtle">
          <div>
            <input
              type="text"
              required
              placeholder="CODE (e.g. SPECIAL_GLUE)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono text-xs uppercase"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="Description (e.g. Special Marine Epoxy per kg)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-sans text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              required
              placeholder="Price (IDR)"
              value={newValue || ''}
              onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-white font-mono text-xs"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-surface-elevated hover:bg-neutral-800 border border-border-subtle text-accent-blue hover:text-white text-xs font-semibold whitespace-nowrap transition-colors"
            >
              + Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
