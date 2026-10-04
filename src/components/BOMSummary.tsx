'use client';

import React from 'react';
import type { CostResult } from '@bom/engine';
import { formatIDR } from './RateCockpit';

interface BOMSummaryProps {
  costResult: CostResult | null;
  projectQty: number;
  itemName: string;
  itemCode: string;
  hasPartialWarning?: boolean;
  ohPct?: number; // overhead percentage (0-100)
}

export default function BOMSummary({
  costResult,
  projectQty,
  itemName,
  itemCode,
  hasPartialWarning,
  ohPct,
}: BOMSummaryProps) {
  const directCost = costResult?.direct || 0;
  const misc = costResult?.misc || 0;
  const overhead = costResult?.overhead || 0;
  const unitHPP = costResult?.unit_cost || 0;
  const totalProjectCost = costResult?.project_total || unitHPP * (projectQty || 1);
  const ohLabel = ohPct !== undefined ? ohPct.toFixed(4) : '12.9929';

  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl p-5 flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 gap-2">
        <div>
          <span className="text-[11px] font-mono text-accent-blue font-semibold">{itemCode}</span>
          <h2 className="text-base font-bold text-white tracking-tight">{itemName}</h2>
        </div>
        <div className="flex items-center gap-2">
          {hasPartialWarning && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-accent-amber-bg border border-accent-amber/30 text-accent-amber text-[11px] font-medium">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span>Kalkulasi Parsial (Ada Part Rp 0)</span>
            </div>
          )}
          <div className="px-3 py-1 rounded bg-surface-elevated border border-border-subtle text-xs font-mono text-text-subtle">
            Qty Proyek: <span className="text-white font-bold">{projectQty || 1} unit</span>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
          <span className="text-text-muted text-[11px] block">Bahan Baku Kayu, Panel & Fasteners</span>
          <span className="text-white font-mono font-semibold text-sm">
            {formatIDR((costResult?.timber || 0) + (costResult?.fasteners || 0) + (costResult?.panels_cost || 0))}
          </span>
        </div>
        <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
          <span className="text-text-muted text-[11px] block">Finishing (Flat 6-Sisi)</span>
          <span className="text-white font-mono font-semibold text-sm">
            {formatIDR(costResult?.finishing || 0)}
          </span>
        </div>
        <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
          <span className="text-text-muted text-[11px] block">Hardware & Aksesori</span>
          <span className="text-white font-mono font-semibold text-sm">
            {formatIDR(costResult?.hardware_cost || 0)}
          </span>
        </div>
        <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
          <span className="text-text-muted text-[11px] block">Kemasan / Packing</span>
          <span className="text-white font-mono font-semibold text-sm">
            {formatIDR(costResult?.packing || 0)}
          </span>
        </div>
      </div>

      {/* HPP & OVERHEAD TOTALS BANNER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-surface-elevated to-surface-card border border-border-strong flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-muted">Biaya Langsung (Direct Cost):</span>
          <span className="font-mono text-base text-neutral-300 font-semibold">{formatIDR(directCost)}</span>
          <span className="text-[11px] text-text-subtle font-mono">
            + Biaya Tak Terduga (Misc 2%): {formatIDR(misc)}
          </span>
          <span className="text-[11px] text-text-subtle font-mono">
            + Factory Overhead ({ohLabel}%): {formatIDR(overhead)}
          </span>
        </div>

        <div className="flex items-baseline md:items-end flex-col border-t md:border-t-0 md:border-l border-border-subtle pt-3 md:pt-0 md:pl-6">
          <span className="text-xs uppercase tracking-wider text-accent-green font-semibold">Total HPP per Unit</span>
          <span className="font-mono text-2xl font-bold text-white tracking-tight">
            {formatIDR(unitHPP)}
          </span>
          <span className="text-[11px] font-mono text-text-muted mt-0.5">
            Total Proyek ({projectQty}x): {formatIDR(totalProjectCost)}
          </span>
        </div>
      </div>
    </div>
  );
}
