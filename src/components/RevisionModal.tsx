'use client';

import React from 'react';
import type { CostResult } from '@bom/engine';
import { formatIDR } from './RateCockpit';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
  rev1Snapshot: CostResult | null;
  currentHPP: number;
}

export default function RevisionModal({
  isOpen,
  onClose,
  isLocked,
  onToggleLock,
  rev1Snapshot,
  currentHPP,
}: RevisionModalProps) {
  if (!isOpen) return null;

  const rev1HPP = rev1Snapshot?.unit_cost || currentHPP;
  const delta = currentHPP - rev1HPP;
  const deltaPct = rev1HPP > 0 ? (delta / rev1HPP) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-strong rounded-xl max-w-lg w-full p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-green text-[20px]">history</span>
            <h3 className="font-semibold text-sm text-white">Kontrol Revisi & Komparasi Snapshot BOM</h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-text-subtle font-medium">Status Penguncian BOM:</span>
              <span className="text-white font-semibold mt-0.5">
                {isLocked ? '🔒 TERKUNCI (Snapshot Rev 1 Aktif)' : '🔓 AKTIF (Dapat Dimutasi)'}
              </span>
            </div>
            <button
              onClick={onToggleLock}
              className={`px-3 py-1.5 rounded font-semibold text-xs transition-colors ${
                isLocked
                  ? 'bg-surface-card hover:bg-surface-subtle text-accent-rose border border-border-subtle'
                  : 'bg-accent-green text-black hover:bg-accent-green/90'
              }`}
            >
              {isLocked ? 'Buka Kunci' : 'Kunci Rev 1'}
            </button>
          </div>

          <div className="bg-surface-elevated rounded-lg p-3 border border-border-subtle flex flex-col gap-2">
            <span className="text-text-muted text-[11px] font-semibold">KOMPARASI REVISI (REV 1 vs SAAT INI)</span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-surface-card p-2 rounded border border-border-subtle">
                <span className="text-text-muted text-[10px] block">Rev 1 Snapshot:</span>
                <span className="text-white font-semibold">{formatIDR(rev1HPP)}</span>
              </div>
              <div className="bg-surface-card p-2 rounded border border-border-subtle">
                <span className="text-text-muted text-[10px] block">Nilai Saat Ini:</span>
                <span className="text-accent-blue font-semibold">{formatIDR(currentHPP)}</span>
              </div>
              <div className="bg-surface-card p-2 rounded border border-border-subtle">
                <span className="text-text-muted text-[10px] block">Delta Selisih:</span>
                <span
                  className={`font-semibold ${
                    delta > 0 ? 'text-accent-rose' : delta < 0 ? 'text-accent-green' : 'text-text-muted'
                  }`}
                >
                  {delta > 0 ? '+' : ''}
                  {formatIDR(delta)} ({deltaPct > 0 ? '+' : ''}{deltaPct.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-surface-elevated hover:bg-surface-subtle text-white text-xs border border-border-subtle"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
