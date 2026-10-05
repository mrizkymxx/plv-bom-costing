'use client';

import React, { useState } from 'react';
import type { BomInput } from '@bom/engine';
import { useTranslation } from '@/lib/i18n';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newItem: BomInput, batchTag: string) => Promise<void>;
  existingBatches: string[];
}

export default function CreateItemModal({
  isOpen,
  onClose,
  onCreate,
  existingBatches,
}: CreateItemModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [qty, setQty] = useState(10);
  const [ov, setOv] = useState(0);
  const [bv, setBv] = useState(0);
  const [length, setLength] = useState(600);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(450);
  const [finishRecipe, setFinishRecipe] = useState('NC NATURAL');
  const [batch, setBatch] = useState(existingBatches[0] || 'Overwater Villa (OV)');
  const [customBatch, setCustomBatch] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [dwgLink, setDwgLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setErrorMsg('Item Code and Name are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const finalBatch = batch === '__NEW__' ? customBatch.trim() : batch;

      const newItem: BomInput = {
        header: {
          item_code: code.trim().toUpperCase(),
          item_name: name.trim(),
          project_qty: qty,
          overall_l: length,
          overall_w: width,
          overall_h: height,
          finish_recipe: finishRecipe,
          photo_url: photoUrl.trim() || undefined,
          drawing_link: dwgLink.trim() || undefined,
        },
        solid: [
          {
            line_no: 1,
            component: 'Main Frame Part',
            material: 'TEAK',
            l: length,
            w: 80,
            t: 25,
            qty: 2,
            exposed: 'Y',
            curved: 'N',
          },
        ],
        panels: [],
        hardware: [],
        boxes: [
          {
            box_no: 1,
            contents: 'Standard Carton Box',
            l: length + 40,
            w: width + 40,
            h: height + 40,
            qty: 1,
          },
        ],
      };

      await onCreate(newItem, finalBatch);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#14181F] border border-border-strong rounded-2xl max-w-xl w-full p-6 flex flex-col gap-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-accent-blue text-[22px]">add_box</span>
            <div>
              <h3 className="font-semibold text-sm text-white">Create New Furniture Item</h3>
              <p className="text-[11px] text-text-muted">Enter core specifications to initialize cutlist breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white p-1">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-200 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Item Code (Unique):</label>
              <input
                type="text"
                required
                placeholder="e.g. TB-04"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-border-strong uppercase"
              />
            </div>

            <div>
              <label className="text-text-muted text-[11px] block mb-1">Batch / Folder Group:</label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-sans text-xs focus:border-border-strong"
              >
                {existingBatches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="__NEW__">+ Create New Batch Folder...</option>
              </select>
            </div>
          </div>

          {batch === '__NEW__' && (
            <div>
              <label className="text-text-muted text-[11px] block mb-1">New Batch Folder Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Restaurant & Bar"
                value={customBatch}
                onChange={(e) => setCustomBatch(e.target.value)}
                className="w-full bg-surface-elevated border border-accent-blue/50 rounded-lg px-3 py-2 text-white font-sans text-xs focus:border-border-strong"
              />
            </div>
          )}

          <div>
            <label className="text-text-muted text-[11px] block mb-1">Model Name / Description:</label>
            <input
              type="text"
              required
              placeholder="e.g. Teak Lounge Coffee Table"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-sans text-xs focus:border-border-strong"
            />
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Total Qty (Pcs):</label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-border-strong"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">OV Villa Qty:</label>
              <input
                type="number"
                min="0"
                value={ov}
                onChange={(e) => setOv(parseInt(e.target.value) || 0)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-border-strong"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">BV Villa Qty:</label>
              <input
                type="number"
                min="0"
                value={bv}
                onChange={(e) => setBv(parseInt(e.target.value) || 0)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-border-strong"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Length (mm):</label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-border-strong"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Width (mm):</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-border-strong"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Height (mm):</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-border-strong"
              />
            </div>
          </div>

          {/* Links & Photo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted text-[11px] block mb-1">Photo URL (Optional):</label>
              <input
                type="url"
                placeholder="https://..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-border-strong"
              />
            </div>
            <div>
              <label className="text-text-muted text-[11px] block mb-1">AutoCAD DWG Link (Drive):</label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={dwgLink}
                onChange={(e) => setDwgLink(e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-border-strong"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-neutral-800 text-neutral-300 font-sans text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-accent-blue hover:bg-sky-400 text-black font-semibold font-sans text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create & Open Breakdown'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
