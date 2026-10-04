'use client';

import React, { useState, useMemo } from 'react';
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

import RateCockpit, { formatIDR } from '@/components/RateCockpit';
import BOMTable from '@/components/BOMTable';
import BOMSummary from '@/components/BOMSummary';
import ExcelActions from '@/components/ExcelActions';
import CloudSyncModal from '@/components/CloudSyncModal';
import RevisionModal from '@/components/RevisionModal';

export default function BOMCostingDashboard() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'bom' | 'rates'>('bom');
  const [selectedItemIdx, setSelectedItemIdx] = useState<number>(0);

  // Rate Inputs State
  const [rateInputs, setRateInputs] = useState<RateInputs>({ ...REFERENCE_RATE_INPUTS });
  const [panelRateInputs, setPanelRateInputs] = useState<PanelRateInputs>({ ...REFERENCE_PANEL_INPUTS });

  // Items State (defaults to 4 reference items)
  const [items, setItems] = useState<BomInput[]>(() => {
    return REFERENCE_ITEMS.map((item) => JSON.parse(JSON.stringify(item.input)));
  });

  // Revision & Lock State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [rev1Snapshot, setRev1Snapshot] = useState<any>(null);

  // Modals
  const [isCloudOpen, setIsCloudOpen] = useState<boolean>(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState<boolean>(false);

  // 1. Reactive Derived Rates
  const derivedRates = useMemo(() => {
    return deriveRates(rateInputs);
  }, [rateInputs]);

  const derivedPanelRates = useMemo(() => {
    return derivePanelRates(panelRateInputs);
  }, [panelRateInputs]);

  // Combine rates for costItem
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

  // 3. Batch Update handler for rates
  const handleRateBatchUpdate = (newRates: Partial<RateInputs>, newPanelRates: Partial<PanelRateInputs>) => {
    setRateInputs((prev) => ({ ...prev, ...newRates }));
    setPanelRateInputs((prev) => ({ ...prev, ...newPanelRates }));
  };

  // 4. Lock BOM handler (Rule 7: freeze rate snapshot and cost result)
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

  return (
    <div className="min-h-screen flex flex-col bg-surface text-neutral-200">
      {/* HEADER */}
      <header className="border-b border-border-subtle bg-surface-card/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-surface-elevated border border-border-strong flex items-center justify-center font-mono font-bold text-white text-xs">
              PLV
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm tracking-tight text-white">BOM Costing & Rate Cockpit</h1>
                <span className="text-[10px] font-mono uppercase bg-accent-green-bg text-accent-green border border-accent-green/30 px-1.5 py-0.2 rounded font-semibold tracking-wider">
                  Next.js 15
                </span>
              </div>
              <span className="text-[11px] text-text-muted">Standard Furniture Costing • Precision down to Rupiah</span>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center bg-surface-elevated p-1 rounded-lg border border-border-subtle shrink-0">
            <button
              onClick={() => setActiveTab('bom')}
              className={`px-2.5 sm:px-3.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'bom' ? 'bg-neutral-800 text-white shadow-sm' : 'text-text-subtle hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">inventory_2</span>
              <span className="hidden sm:inline">Kalkulasi Item BOM</span>
              <span className="sm:hidden">BOM</span>
              <span className="ml-0.5 sm:ml-1 text-[10px] font-mono bg-neutral-700 px-1.5 py-0.2 rounded">{items.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-2.5 sm:px-3.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'rates' ? 'bg-neutral-800 text-white shadow-sm' : 'text-text-subtle hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">tune</span>
              <span className="hidden sm:inline">Master Tarif & Rate Card</span>
              <span className="sm:hidden">Tarif</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRevisionOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-xs text-text-subtle hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-accent-green">
                {isLocked ? 'lock' : 'difference'}
              </span>
              <span>{isLocked ? 'Terkunci (Rev 1)' : 'Kontrol Revisi'}</span>
            </button>

            <button
              onClick={() => setIsCloudOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-xs text-accent-blue hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">database</span>
              <span className="hidden md:inline">Cloud Sync</span>
            </button>
          </div>
        </div>
      </header>

      {/* SUB-HEADER TOOLBAR FOR ACTIVE ITEM */}
      {activeTab === 'bom' && (
        <div className="bg-surface-card/60 border-b border-border-subtle px-4 lg:px-6 py-2.5">
          <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Item Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scroll pb-1 sm:pb-0">
              <span className="text-xs text-text-muted mr-1 font-medium whitespace-nowrap">Pilih Item:</span>
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedItemIdx(idx)}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all whitespace-nowrap ${
                    selectedItemIdx === idx
                      ? 'bg-accent-blue text-black font-semibold'
                      : 'bg-surface-elevated text-text-subtle hover:text-white border border-border-subtle'
                  }`}
                >
                  {item.header?.item_code || `ITEM-${idx + 1}`}
                </button>
              ))}
            </div>

            {/* Excel Actions */}
            <ExcelActions
              rateInputs={rateInputs}
              panelRateInputs={panelRateInputs}
              onRateInputsBatchUpdate={handleRateBatchUpdate}
              currentBOM={currentItem}
              costResult={effectiveCostResult}
            />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto p-4 lg:p-6 flex flex-col gap-6">
        {activeTab === 'rates' ? (
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
          <>
            {/* BOM Summary Top Banner */}
            <BOMSummary
              costResult={effectiveCostResult}
              projectQty={currentItem.header?.project_qty || 1}
              itemName={currentItem.header?.item_name || 'Item Furniture'}
              itemCode={currentItem.header?.item_code || 'ITEM-01'}
              hasPartialWarning={hasPartialWarning}
              ohPct={derivedRates.OH_PCT !== undefined ? derivedRates.OH_PCT * 100 : undefined}
            />

            {/* BOM Cutlist Tables */}
            <BOMTable bomItem={currentItem} costResult={effectiveCostResult} isLocked={isLocked} />
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border-subtle py-4 px-6 text-center text-xs text-text-muted font-mono">
        PLV BOM Costing Enterprise Engine • Master Blueprint 27 Keputusan Jepara Standard • Full TS Next.js 15
      </footer>

      {/* MODALS */}
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
