'use client';

import React, { useState } from 'react';
import type { BomInput, SolidLine, PanelLine, HardwareLine, Box } from '@bom/engine';
import { formatIDR } from './RateCockpit';
import { useTranslation } from '@/lib/i18n';

interface EditableBOMTableProps {
  bomItem: BomInput;
  costResult: any;
  onChange: (updatedItem: BomInput) => void;
  onSaveToDatabase: () => Promise<void>;
  isLocked?: boolean;
}

export default function EditableBOMTable({
  bomItem,
  costResult,
  onChange,
  onSaveToDatabase,
  isLocked = false,
}: EditableBOMTableProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const solidLines = bomItem.solid || [];
  const panelLines = bomItem.panels || [];
  const hardwareLines = bomItem.hardware || [];
  const boxRows = bomItem.boxes || [];

  // --- Handlers for Solid Wood ---
  const handleSolidChange = (index: number, field: keyof SolidLine, value: any) => {
    if (isLocked) return;
    const updated = [...solidLines];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...bomItem, solid: updated });
  };

  const handleAddSolidLine = () => {
    if (isLocked) return;
    const newLine: SolidLine = {
      line_no: solidLines.length + 1,
      component: 'New Wood Part',
      material: 'TEAK',
      l: 500,
      w: 80,
      t: 25,
      qty: 1,
      exposed: 'Y',
      curved: 'N',
    };
    onChange({ ...bomItem, solid: [...solidLines, newLine] });
  };

  const handleDeleteSolidLine = (index: number) => {
    if (isLocked) return;
    const updated = solidLines.filter((_, idx) => idx !== index);
    onChange({ ...bomItem, solid: updated });
  };

  // --- Handlers for Panels ---
  const handlePanelChange = (index: number, field: keyof PanelLine, value: any) => {
    if (isLocked) return;
    const updated = [...panelLines];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...bomItem, panels: updated });
  };

  const handleAddPanelLine = () => {
    if (isLocked) return;
    const newLine: PanelLine = {
      line_no: panelLines.length + 1,
      component: 'New Panel Component',
      panel_type: 'PLY-12-RAW',
      l: 1220,
      w: 610,
      t: 12,
      qty: 1,
      exposed_faces: 1,
    };
    onChange({ ...bomItem, panels: [...panelLines, newLine] });
  };

  const handleDeletePanelLine = (index: number) => {
    if (isLocked) return;
    const updated = panelLines.filter((_, idx) => idx !== index);
    onChange({ ...bomItem, panels: updated });
  };

  // --- Handlers for Hardware & Subcontract ---
  const handleHardwareChange = (index: number, field: keyof HardwareLine, value: any) => {
    if (isLocked) return;
    const updated = [...hardwareLines];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...bomItem, hardware: updated });
  };

  const handleAddHardwareLine = () => {
    if (isLocked) return;
    const newLine: HardwareLine = {
      line_no: hardwareLines.length + 1,
      item_code: `HW-${hardwareLines.length + 1}`,
      description: 'New Fitting / Subcontract Item',
      qty: 1,
      uom: 'pcs',
      unit_price: 15000,
    };
    onChange({ ...bomItem, hardware: [...hardwareLines, newLine] });
  };

  const handleDeleteHardwareLine = (index: number) => {
    if (isLocked) return;
    const updated = hardwareLines.filter((_, idx) => idx !== index);
    onChange({ ...bomItem, hardware: updated });
  };

  // --- Handlers for Boxes / Packing ---
  const handleBoxChange = (index: number, field: keyof Box, value: any) => {
    if (isLocked) return;
    const updated = [...boxRows];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...bomItem, boxes: updated });
  };

  const handleAddBoxRow = () => {
    if (isLocked) return;
    const newBox: Box = {
      box_no: boxRows.length + 1,
      contents: 'Carton Package',
      l: (bomItem.header?.overall_l || 500) + 40,
      w: (bomItem.header?.overall_w || 500) + 40,
      h: (bomItem.header?.overall_h || 500) + 40,
      qty: 1,
    };
    onChange({ ...bomItem, boxes: [...boxRows, newBox] });
  };

  const handleDeleteBoxRow = (index: number) => {
    if (isLocked) return;
    const updated = boxRows.filter((_, idx) => idx !== index);
    onChange({ ...bomItem, boxes: updated });
  };

  // Save to Supabase trigger
  const handleSaveClick = async () => {
    try {
      setIsSaving(true);
      await onSaveToDatabase();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save BOM to database:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ACTION BAR: SAVE TO SUPABASE & RECALC STATUS */}
      <div className="bg-[#14181F] border border-border-strong rounded-xl p-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-accent-blue">edit_note</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">Interactive Breakdown Editor</span>
            <span className="text-[11px] text-text-muted">
              Edit any dimension or rate — calculation engine updates instantaneously
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-mono text-accent-green flex items-center gap-1 font-semibold animate-fade-in">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Saved to Supabase
            </span>
          )}

          <button
            onClick={handleSaveClick}
            disabled={isSaving || isLocked}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue hover:bg-sky-400 text-black font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSaving ? 'hourglass_top' : 'save'}
            </span>
            <span>{isSaving ? 'Saving...' : 'Save Changes to Cloud'}</span>
          </button>
        </div>
      </div>

      {/* 1. SOLID WOOD CUTLIST */}
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-green text-[18px]">table_rows</span>
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider">{t('solidWood')}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-muted">{solidLines.length} parts</span>
            <button
              onClick={handleAddSolidLine}
              disabled={isLocked}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-neutral-800 border border-border-subtle text-xs text-accent-green hover:text-white transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Add Part</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scroll">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted bg-surface-elevated/20 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[160px]">Component Name</th>
                <th className="py-2.5 px-3 w-28">Material</th>
                <th className="py-2.5 px-2 w-20 text-right">L (mm)</th>
                <th className="py-2.5 px-2 w-20 text-right">W (mm)</th>
                <th className="py-2.5 px-2 w-20 text-right">T (mm)</th>
                <th className="py-2.5 px-2 w-16 text-right">Qty</th>
                <th className="py-2.5 px-2 w-20 text-center">Exposed</th>
                <th className="py-2.5 px-2 w-20 text-center">Tier</th>
                <th className="py-2.5 px-3 w-24 text-right">Vol (m³)</th>
                <th className="py-2.5 px-3 w-32 text-right">Line Cost</th>
                <th className="py-2.5 px-2 w-12 text-center">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
              {solidLines.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-6 text-center text-text-muted font-sans text-xs">
                    No solid wood parts in this item. Click "Add Part" to insert.
                  </td>
                </tr>
              ) : (
                solidLines.map((line, idx) => {
                  const res = costResult?.solid?.[idx];
                  return (
                    <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-2 px-3 text-center text-text-muted">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={line.component || ''}
                          onChange={(e) => handleSolidChange(idx, 'component', e.target.value)}
                          disabled={isLocked}
                          className="w-full bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white font-sans text-xs focus:border-border-strong"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={line.material || 'TEAK'}
                          onChange={(e) => handleSolidChange(idx, 'material', e.target.value)}
                          disabled={isLocked}
                          className="w-full bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white font-mono text-xs focus:border-border-strong"
                        >
                          <option value="TEAK">TEAK</option>
                          <option value="MINDI">MINDI</option>
                          <option value="MERANTI">MERANTI</option>
                          <option value="OTHER">OTHER</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={line.l || 0}
                          onChange={(e) => handleSolidChange(idx, 'l', parseFloat(e.target.value) || 0)}
                          disabled={isLocked}
                          className="w-20 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs focus:border-border-strong"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={line.w || 0}
                          onChange={(e) => handleSolidChange(idx, 'w', parseFloat(e.target.value) || 0)}
                          disabled={isLocked}
                          className="w-20 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs focus:border-border-strong"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={line.t || 0}
                          onChange={(e) => handleSolidChange(idx, 't', parseFloat(e.target.value) || 0)}
                          disabled={isLocked}
                          className="w-20 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs focus:border-border-strong"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={line.qty || 1}
                          onChange={(e) => handleSolidChange(idx, 'qty', parseFloat(e.target.value) || 1)}
                          disabled={isLocked}
                          className="w-16 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs focus:border-border-strong"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <select
                          value={line.exposed || 'Y'}
                          onChange={(e) => handleSolidChange(idx, 'exposed', e.target.value)}
                          disabled={isLocked}
                          className="bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white font-mono text-xs text-center"
                        >
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-surface-elevated border border-border-subtle text-accent-green font-bold">
                          {res?.auto_tier || line.tier_override || 'B'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-text-subtle">
                        {res?.vol_m3
                          ? res.vol_m3.toFixed(4)
                          : (((line.l || 0) * (line.w || 0) * (line.t || 0) * (line.qty || 1)) / 1e9).toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-white">
                        {formatIDR(res?.cost || 0)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleDeleteSolidLine(idx)}
                          disabled={isLocked}
                          className="p-1 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Delete row"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. PANEL & PLYWOOD CUTLIST */}
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-blue text-[18px]">layers</span>
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider">{t('panels')}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-muted">{panelLines.length} panels</span>
            <button
              onClick={handleAddPanelLine}
              disabled={isLocked}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-neutral-800 border border-border-subtle text-xs text-accent-blue hover:text-white transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Add Panel</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scroll">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted bg-surface-elevated/20 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[160px]">Component Name</th>
                <th className="py-2.5 px-3 w-36">Panel Type</th>
                <th className="py-2.5 px-2 w-20 text-right">L (mm)</th>
                <th className="py-2.5 px-2 w-20 text-right">W (mm)</th>
                <th className="py-2.5 px-2 w-20 text-right">T (mm)</th>
                <th className="py-2.5 px-2 w-16 text-right">Qty</th>
                <th className="py-2.5 px-2 w-20 text-center">Faces</th>
                <th className="py-2.5 px-3 w-28 text-right">Sheets Charged</th>
                <th className="py-2.5 px-3 w-32 text-right">Line Cost</th>
                <th className="py-2.5 px-2 w-12 text-center">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
              {panelLines.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-6 text-center text-text-muted font-sans text-xs">
                    No panel sheets in this item. Click "Add Panel" to insert.
                  </td>
                </tr>
              ) : (
                panelLines.map((p, idx) => {
                  const res = costResult?.panels?.[idx];
                  return (
                    <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-2 px-3 text-center text-text-muted">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={p.component || ''}
                          onChange={(e) => handlePanelChange(idx, 'component', e.target.value)}
                          disabled={isLocked}
                          className="w-full bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white font-sans text-xs focus:border-border-strong"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={p.panel_type || 'PLY-12-RAW'}
                          onChange={(e) => handlePanelChange(idx, 'panel_type', e.target.value)}
                          disabled={isLocked}
                          className="w-full bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white font-mono text-xs"
                        >
                          <option value="PLY-3-RAW">PLY-3-RAW</option>
                          <option value="PLY-6-RAW">PLY-6-RAW</option>
                          <option value="PLY-9-RAW">PLY-9-RAW</option>
                          <option value="PLY-12-RAW">PLY-12-RAW</option>
                          <option value="PLY-15-RAW">PLY-15-RAW</option>
                          <option value="PLY-18-RAW">PLY-18-RAW</option>
                          <option value="PLY-24-RAW">PLY-24-RAW</option>
                          <option value="PLY-18-TDF">PLY-18-TDF (Teak 2-Face)</option>
                          <option value="PLY-15-TDF">PLY-15-TDF (Teak 2-Face)</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={p.l || 0}
                          onChange={(e) => handlePanelChange(idx, 'l', parseFloat(e.target.value) || 0)}
                          disabled={isLocked}
                          className="w-20 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={p.w || 0}
                          onChange={(e) => handlePanelChange(idx, 'w', parseFloat(e.target.value) || 0)}
                          disabled={isLocked}
                          className="w-20 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={p.t || 12}
                          onChange={(e) => handlePanelChange(idx, 't', parseFloat(e.target.value) || 12)}
                          disabled={isLocked}
                          className="w-20 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={p.qty || 1}
                          onChange={(e) => handlePanelChange(idx, 'qty', parseFloat(e.target.value) || 1)}
                          disabled={isLocked}
                          className="w-16 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <select
                          value={p.exposed_faces ?? 1}
                          onChange={(e) => handlePanelChange(idx, 'exposed_faces', parseInt(e.target.value))}
                          disabled={isLocked}
                          className="bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white font-mono text-xs text-center"
                        >
                          <option value="1">1 Face</option>
                          <option value="2">2 Faces</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-text-subtle">
                        {res?.sheets_charged ? res.sheets_charged.toFixed(3) : '0.000'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-white">
                        {formatIDR(res?.cost || 0)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleDeletePanelLine(idx)}
                          disabled={isLocked}
                          className="p-1 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. HARDWARE & SUBCONTRACT */}
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-yellow text-[18px]">build</span>
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
              {t('hardware')} & Subcontract
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-muted">{hardwareLines.length} items</span>
            <button
              onClick={handleAddHardwareLine}
              disabled={isLocked}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-neutral-800 border border-border-subtle text-xs text-accent-yellow hover:text-white transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Add Hardware / Service</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scroll">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted bg-surface-elevated/20 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 w-28">Code</th>
                <th className="py-2.5 px-4 min-w-[200px]">Description</th>
                <th className="py-2.5 px-2 w-20 text-right">Qty</th>
                <th className="py-2.5 px-2 w-16 text-center">UoM</th>
                <th className="py-2.5 px-3 w-36 text-right">Unit Price (IDR)</th>
                <th className="py-2.5 px-4 w-36 text-right">Subtotal</th>
                <th className="py-2.5 px-2 w-12 text-center">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
              {hardwareLines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-text-muted font-sans text-xs">
                    No hardware or subcontract services in this item.
                  </td>
                </tr>
              ) : (
                hardwareLines.map((h, idx) => {
                  const lineTotal = (h.qty || 1) * (h.unit_price || 0);
                  return (
                    <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-2 px-3 text-center text-text-muted">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={h.item_code || ''}
                          onChange={(e) => handleHardwareChange(idx, 'item_code', e.target.value)}
                          disabled={isLocked}
                          className="w-full bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white font-mono text-xs"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={h.description || ''}
                          onChange={(e) => handleHardwareChange(idx, 'description', e.target.value)}
                          disabled={isLocked}
                          className="w-full bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white font-sans text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={h.qty || 1}
                          onChange={(e) => handleHardwareChange(idx, 'qty', parseFloat(e.target.value) || 1)}
                          disabled={isLocked}
                          className="w-20 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-center text-text-muted">
                        <input
                          type="text"
                          value={h.uom || 'pcs'}
                          onChange={(e) => handleHardwareChange(idx, 'uom', e.target.value)}
                          disabled={isLocked}
                          className="w-14 bg-surface-elevated border border-border-subtle rounded px-1.5 py-1 text-white text-center font-mono text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={h.unit_price || 0}
                          onChange={(e) => handleHardwareChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                          disabled={isLocked}
                          className="w-32 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                        />
                      </td>
                      <td className="py-2 px-4 text-right font-semibold text-white">
                        {formatIDR(lineTotal)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleDeleteHardwareLine(idx)}
                          disabled={isLocked}
                          className="p-1 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PACKING & CARTON BOXES */}
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[18px]">inventory</span>
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider">{t('packaging')}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-muted">{boxRows.length} boxes</span>
            <button
              onClick={handleAddBoxRow}
              disabled={isLocked}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-neutral-800 border border-border-subtle text-xs text-amber-400 hover:text-white transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Add Box</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scroll">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted bg-surface-elevated/20 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3 w-14 text-center">Box #</th>
                <th className="py-2.5 px-4 min-w-[200px]">Contents</th>
                <th className="py-2.5 px-2 w-24 text-right">L (mm)</th>
                <th className="py-2.5 px-2 w-24 text-right">W (mm)</th>
                <th className="py-2.5 px-2 w-24 text-right">H (mm)</th>
                <th className="py-2.5 px-2 w-20 text-right">Qty</th>
                <th className="py-2.5 px-2 w-12 text-center">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
              {boxRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-text-muted font-sans text-xs">
                    No custom box rows. Engine automatically falls back to overall item dimensions + 40mm buffer.
                  </td>
                </tr>
              ) : (
                boxRows.map((b, idx) => (
                  <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-2 px-3 text-center text-text-muted">{b.box_no || idx + 1}</td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={b.contents || ''}
                        onChange={(e) => handleBoxChange(idx, 'contents', e.target.value)}
                        disabled={isLocked}
                        className="w-full bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white font-sans text-xs"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        value={b.l || 0}
                        onChange={(e) => handleBoxChange(idx, 'l', parseFloat(e.target.value) || 0)}
                        disabled={isLocked}
                        className="w-24 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        value={b.w || 0}
                        onChange={(e) => handleBoxChange(idx, 'w', parseFloat(e.target.value) || 0)}
                        disabled={isLocked}
                        className="w-24 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        value={b.h || 0}
                        onChange={(e) => handleBoxChange(idx, 'h', parseFloat(e.target.value) || 0)}
                        disabled={isLocked}
                        className="w-24 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        value={b.qty || 1}
                        onChange={(e) => handleBoxChange(idx, 'qty', parseFloat(e.target.value) || 1)}
                        disabled={isLocked}
                        className="w-20 bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-white text-right font-mono text-xs"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleDeleteBoxRow(idx)}
                        disabled={isLocked}
                        className="p-1 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
