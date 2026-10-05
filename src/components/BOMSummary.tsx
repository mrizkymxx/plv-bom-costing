'use client';

import React, { useState } from 'react';
import type { CostResult } from '@bom/engine';
import { formatIDR } from './RateCockpit';
import { useTranslation } from '@/lib/i18n';

interface BOMSummaryProps {
  costResult: CostResult | null;
  projectQty: number;
  itemName: string;
  itemCode: string;
  hasPartialWarning?: boolean;
  ohPct?: number; // overhead percentage (0-100)
  photoUrl?: string;
  dwgLink?: string;
  specLink?: string;
  notes?: string;
}

export default function BOMSummary({
  costResult,
  projectQty,
  itemName,
  itemCode,
  hasPartialWarning,
  ohPct,
  photoUrl,
  dwgLink,
  specLink,
  notes,
}: BOMSummaryProps) {
  const { t } = useTranslation();
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const directCost = costResult?.direct || 0;
  const misc = costResult?.misc || 0;
  const overhead = costResult?.overhead || 0;
  const unitHPP = costResult?.unit_cost || 0;
  const totalProjectCost = costResult?.project_total || unitHPP * (projectQty || 1);
  const ohLabel = ohPct !== undefined ? ohPct.toFixed(2) : '12.99';

  const targetMargin = 30;
  const sellingPrice = Math.round(unitHPP / (1 - targetMargin / 100));

  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl p-5 flex flex-col gap-5">
      {/* HEADER CARD WITH PHOTO & SPECS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <button
              onClick={() => setIsPhotoZoomed(true)}
              className="w-16 h-16 rounded-lg border border-border-subtle overflow-hidden bg-surface-elevated shrink-0 group relative hover:border-accent-blue transition-all"
              title="Click to view full photo"
            >
              <img src={photoUrl} alt={itemCode} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-white text-[16px]">zoom_in</span>
              </div>
            </button>
          ) : (
            <div className="w-16 h-16 rounded-lg border border-border-subtle bg-surface-elevated flex items-center justify-center text-text-muted shrink-0">
              <span className="material-symbols-outlined text-[24px]">chair</span>
            </div>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-surface-elevated border border-border-subtle text-accent-blue font-bold px-2 py-0.5 rounded">
                {itemCode}
              </span>
              {hasPartialWarning && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent-amber-bg border border-accent-amber/30 text-accent-amber text-[10px] font-medium">
                  <span className="material-symbols-outlined text-[12px]">warning</span>
                  <span>Partial Cost</span>
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">{itemName}</h2>
            {notes && <p className="text-xs text-text-muted mt-0.5 italic font-mono">{notes}</p>}
          </div>
        </div>

        {/* Quantities & Tech Document Links */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {dwgLink && (
            <a
              href={dwgLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-neutral-800 border border-border-subtle text-xs text-accent-blue hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">draw</span>
              <span>AutoCAD / DWG</span>
            </a>
          )}
          {specLink && (
            <a
              href={specLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-neutral-800 border border-border-subtle text-xs text-accent-green hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              <span>Specs</span>
            </a>
          )}
          <div className="px-3.5 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-xs font-mono text-neutral-300">
            {t('allocation')}: <strong className="text-white text-sm">{projectQty || 1} units</strong>
          </div>
        </div>
      </div>

      {/* 4 PRIMARY COST CATEGORIES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
          <span className="text-text-muted text-[11px] block">{t('solidWood')} & {t('panels')}</span>
          <span className="text-white font-mono font-semibold text-base mt-1 block">
            {formatIDR((costResult?.timber || 0) + (costResult?.fasteners || 0) + (costResult?.panels_cost || 0))}
          </span>
        </div>
        <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
          <span className="text-text-muted text-[11px] block">{t('finishing')}</span>
          <span className="text-white font-mono font-semibold text-base mt-1 block">
            {formatIDR(costResult?.finishing || 0)}
          </span>
        </div>
        <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
          <span className="text-text-muted text-[11px] block">{t('hardware')} & Subcon</span>
          <span className="text-white font-mono font-semibold text-base mt-1 block">
            {formatIDR(costResult?.hardware_cost || 0)}
          </span>
        </div>
        <div className="bg-surface-elevated p-3 rounded-lg border border-border-subtle">
          <span className="text-text-muted text-[11px] block">{t('packaging')}</span>
          <span className="text-white font-mono font-semibold text-base mt-1 block">
            {formatIDR(costResult?.packing || 0)}
          </span>
        </div>
      </div>

      {/* FINAL HPP & SELLING PRICE BANNER */}
      <div className="p-4 rounded-xl bg-[#14181F] border border-border-strong flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-muted font-medium">{t('directCost')}:</span>
          <span className="font-mono text-base text-neutral-200 font-semibold">{formatIDR(directCost)}</span>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-subtle font-mono mt-0.5">
            <span>+ {t('misc')}: {formatIDR(misc)}</span>
            <span>•</span>
            <span>+ {t('overhead')}: {formatIDR(overhead)} ({ohLabel}%)</span>
          </div>
        </div>

        <div className="flex items-start md:items-end flex-col border-t md:border-t-0 md:border-l border-border-subtle pt-3 md:pt-0 md:pl-6 gap-0.5">
          <span className="text-xs uppercase tracking-wider text-accent-yellow font-semibold font-mono">
            {t('unitHpp')}
          </span>
          <span className="font-mono text-2xl font-bold text-accent-yellow tracking-tight">
            {formatIDR(unitHPP)}
          </span>
          <div className="text-[11px] font-mono text-text-muted flex items-center gap-2 mt-0.5">
            <span>Target Price (~30%): <strong className="text-accent-green">{formatIDR(sellingPrice)}</strong></span>
            <span>•</span>
            <span>Total: {formatIDR(totalProjectCost)}</span>
          </div>
        </div>
      </div>

      {/* PHOTO ZOOM MODAL */}
      {isPhotoZoomed && photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsPhotoZoomed(false)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-surface-card border border-border-strong rounded-xl p-2 overflow-hidden shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setIsPhotoZoomed(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-all z-10"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <img src={photoUrl} alt={itemCode} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
