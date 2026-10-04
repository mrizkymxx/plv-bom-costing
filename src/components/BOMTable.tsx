'use client';

import React from 'react';
import type { BomInput } from '@bom/engine';
import { formatIDR } from './RateCockpit';

interface BOMTableProps {
  bomItem: BomInput;
  costResult: any;
  isLocked?: boolean;
}

export default function BOMTable({ bomItem, costResult, isLocked = false }: BOMTableProps) {
  const solidLines = bomItem.solid || [];
  const panelLines = bomItem.panels || [];
  const hardwareLines = bomItem.hardware || [];
  const boxRows =
    costResult?.boxes && costResult.boxes.length > 0
      ? costResult.boxes
      : bomItem.boxes || [];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. SOLID WOOD CUTLIST */}
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-green text-[18px]">table_rows</span>
            <h3 className="font-semibold text-sm text-white">Komponen Kayu Solid (Solid Wood)</h3>
          </div>
          <div className="flex items-center gap-3">
            {isLocked && (
              <span className="text-[10px] font-mono uppercase bg-accent-amber-bg text-accent-amber border border-accent-amber/30 px-2 py-0.5 rounded font-semibold">
                Locked (Read-Only)
              </span>
            )}
            <span className="text-xs font-mono text-text-subtle">{solidLines.length} baris part</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scroll">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted bg-surface-elevated/20">
                <th className="py-2.5 px-3 font-medium">#</th>
                <th className="py-2.5 px-3 font-medium">Komponen</th>
                <th className="py-2.5 px-3 font-medium">Material</th>
                <th className="py-2.5 px-3 font-medium text-right">P (mm)</th>
                <th className="py-2.5 px-3 font-medium text-right">L (mm)</th>
                <th className="py-2.5 px-3 font-medium text-right">T (mm)</th>
                <th className="py-2.5 px-3 font-medium text-right">Qty</th>
                <th className="py-2.5 px-3 font-medium text-center">Tier</th>
                <th className="py-2.5 px-3 font-medium text-right">Vol (m³)</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Biaya Kayu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {solidLines.map((line, idx) => {
                const res = costResult?.solid?.[idx];
                const checkStatus = res?.check || 'OK';
                const isCheckOK = checkStatus === 'OK';
                return (
                  <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-text-muted">{line.line_no || idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{line.component || '-'}</td>
                    <td className="py-2.5 px-3 text-text-subtle font-mono text-[11px]">{line.material || 'TEAK'}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{line.l || 0}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{line.w || 0}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{line.t || 0}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-white">{line.qty || 1}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-surface-elevated border border-border-subtle text-accent-green">
                        {res?.auto_tier || line.tier_override || 'A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-text-subtle">
                      {res?.vol_m3 ? res.vol_m3.toFixed(4) : (((line.l || 0) * (line.w || 0) * (line.t || 0) * (line.qty || 1)) / 1e9).toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                          isCheckOK
                            ? 'bg-accent-green-bg border border-accent-green/20 text-accent-green'
                            : 'bg-accent-amber-bg border border-accent-amber/30 text-accent-amber font-semibold'
                        }`}
                      >
                        {checkStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-white">
                      {formatIDR(res?.cost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. PANEL CUTLIST */}
      {panelLines.length > 0 && (
        <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-amber text-[18px]">layers</span>
              <h3 className="font-semibold text-sm text-white">Komponen Panel & Papan (Sheet Board)</h3>
            </div>
            <div className="flex items-center gap-3">
              {isLocked && (
                <span className="text-[10px] font-mono uppercase bg-accent-amber-bg text-accent-amber border border-accent-amber/30 px-2 py-0.5 rounded font-semibold">
                  Locked (Read-Only)
                </span>
              )}
              <span className="text-xs font-mono text-text-subtle">{panelLines.length} baris part</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto custom-scroll">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted bg-surface-elevated/20">
                  <th className="py-2.5 px-3 font-medium">#</th>
                  <th className="py-2.5 px-3 font-medium">Komponen</th>
                  <th className="py-2.5 px-3 font-medium">Tipe Panel</th>
                  <th className="py-2.5 px-3 font-medium text-right">P (mm)</th>
                  <th className="py-2.5 px-3 font-medium text-right">L (mm)</th>
                  <th className="py-2.5 px-3 font-medium text-right">Tebal</th>
                  <th className="py-2.5 px-3 font-medium text-right">Qty</th>
                  <th className="py-2.5 px-3 font-medium text-right">Lembar Dihitung</th>
                  <th className="py-2.5 px-3 font-medium text-center">Status</th>
                  <th className="py-2.5 px-3 font-medium text-right">Biaya Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {panelLines.map((line, idx) => {
                  const res = costResult?.panels?.[idx];
                  const checkStatus = res?.check || 'OK';
                  const isCheckOK = checkStatus === 'OK';
                  return (
                    <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-text-muted">{line.line_no || idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-white">{line.component || '-'}</td>
                      <td className="py-2.5 px-3 text-text-subtle font-mono text-[11px]">{line.panel_type || 'PLYWOOD'}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{line.l || 0}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{line.w || 0}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{line.t || 0} mm</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-white">{line.qty || 1}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-text-subtle">
                        {res?.sheets_charged !== undefined ? res.sheets_charged.toFixed(3) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                            isCheckOK
                              ? 'bg-accent-green-bg border border-accent-green/20 text-accent-green'
                              : 'bg-accent-amber-bg border border-accent-amber/30 text-accent-amber font-semibold'
                          }`}
                        >
                          {checkStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-white">
                        {formatIDR(res?.cost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. HARDWARE & BOUGHT-IN */}
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-blue text-[18px]">build</span>
            <h3 className="font-semibold text-sm text-white">Aksesori, Hardware & Bought-in Items</h3>
          </div>
          <div className="flex items-center gap-3">
            {isLocked && (
              <span className="text-[10px] font-mono uppercase bg-accent-amber-bg text-accent-amber border border-accent-amber/30 px-2 py-0.5 rounded font-semibold">
                Locked (Read-Only)
              </span>
            )}
            <span className="text-xs font-mono text-text-subtle">{hardwareLines.length} baris item</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scroll">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted bg-surface-elevated/20">
                <th className="py-2.5 px-3 font-medium">Kode</th>
                <th className="py-2.5 px-3 font-medium">Deskripsi Part</th>
                <th className="py-2.5 px-3 font-medium">Vendor</th>
                <th className="py-2.5 px-3 font-medium text-right">Qty</th>
                <th className="py-2.5 px-3 font-medium text-center">Satuan</th>
                <th className="py-2.5 px-3 font-medium text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {hardwareLines.map((line, idx) => {
                const subtotal = (line.qty || 0) * (line.unit_price || 0);
                const isUnpriced = line.unit_price === null || line.unit_price === undefined || line.unit_price === 0;

                return (
                  <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-accent-blue text-[11px]">{line.item_code || `HW-${idx+1}`}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{line.description || '-'}</td>
                    <td className="py-2.5 px-3 text-text-subtle">{line.vendor || 'Standard'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-white">{line.qty || 1}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-text-muted">{line.uom || 'pcs'}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {isUnpriced ? (
                        <span className="text-accent-amber font-semibold bg-accent-amber-bg px-2 py-0.5 rounded text-[10px]">
                          TBD (Rp 0)
                        </span>
                      ) : (
                        formatIDR(line.unit_price)
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-white">
                      {formatIDR(subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PACKING BOX CUTLIST */}
      {boxRows.length > 0 && (
        <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-rose text-[18px]">inventory_2</span>
              <h3 className="font-semibold text-sm text-white">Cutlist Kemasan & Karton (Packing Boxes)</h3>
            </div>
            <span className="text-xs font-mono text-text-subtle">{boxRows.length} box</span>
          </div>

          <div className="w-full overflow-x-auto custom-scroll">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted bg-surface-elevated/20">
                  <th className="py-2.5 px-3 font-medium">Box #</th>
                  <th className="py-2.5 px-3 font-medium">Isi / Konten</th>
                  <th className="py-2.5 px-3 font-medium text-right">P (mm)</th>
                  <th className="py-2.5 px-3 font-medium text-right">L (mm)</th>
                  <th className="py-2.5 px-3 font-medium text-right">T (mm)</th>
                  <th className="py-2.5 px-3 font-medium text-right">Qty Box</th>
                  <th className="py-2.5 px-3 font-medium text-right">Karton (m²)</th>
                  <th className="py-2.5 px-3 font-medium text-right">Vol (m³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {boxRows.map((b: any, idx: number) => (
                  <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-text-muted">{b.box_no || idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{b.contents || `Box ${idx + 1}`}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.carton_l || (b.l ? b.l + 40 : 0)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.carton_w || (b.w ? b.w + 40 : 0)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.carton_h || (b.h ? b.h + 40 : 0)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-white">{b.qty || 1}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-text-subtle">
                      {b.m2 !== undefined ? Number(b.m2).toFixed(3) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-text-subtle">
                      {b.m3 !== undefined ? Number(b.m3).toFixed(4) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}