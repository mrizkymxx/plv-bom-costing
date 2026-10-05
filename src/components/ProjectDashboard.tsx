'use client';

import React, { useState, useMemo } from 'react';
import { formatIDR } from './RateCockpit';
import { useTranslation } from '@/lib/i18n';
import type { WorkspaceView } from './WorkspaceSidebar';

export interface ProjectDashboardItem {
  id?: string;
  item_code: string;
  item_name: string;
  project_qty: number;
  overall_l?: number;
  overall_w?: number;
  overall_h?: number;
  unit_hpp: number;
  selling_price: number;
  target_margin: number;
  finish_recipe?: string;
  solid_components?: any[];
  panel_components?: any[];
  hardware_components?: any[];
  custom_components?: any[];
  box_components?: any[];
  custom_columns?: {
    photo_url?: string;
    dwg_link?: string;
    spec_link?: string;
    notes?: string;
    room_distribution?: {
      ov?: number;
      bv?: number;
      total?: number;
    };
    sawmill_schedule?: {
      belah_25?: number;
      belah_40?: number;
      belah_45?: number;
      belah_50?: number;
    };
  };
}

interface ProjectDashboardProps {
  items: ProjectDashboardItem[];
  currentView: WorkspaceView;
  onSelectItem: (itemCode: string) => void;
  onDownloadTemplate: () => void;
}

export default function ProjectDashboard({
  items,
  currentView,
  onSelectItem,
  onDownloadTemplate,
}: ProjectDashboardProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  // 1. Batch Filtering Logic
  const batchFilteredItems = useMemo(() => {
    return items.filter((it) => {
      const code = (it.item_code || '').toUpperCase();
      const name = (it.item_name || '').toUpperCase();

      switch (currentView) {
        case 'batch-ov':
          return (it.custom_columns?.room_distribution?.ov || 0) > 0;
        case 'batch-bv':
          return (it.custom_columns?.room_distribution?.bv || 0) > 0;
        case 'batch-mirrors':
          return (
            name.includes('MIRROR') ||
            name.includes('CERMIN') ||
            code.includes('AA-02') ||
            code.includes('AA-03') ||
            code.includes('AA-04') ||
            code.includes('AA-07') ||
            code.includes('AA-29')
          );
        case 'batch-seating':
          return (
            name.includes('CHAIR') ||
            name.includes('STOOL') ||
            name.includes('BENCH') ||
            code.includes('SG-01') ||
            code.includes('SG-26') ||
            code.includes('SG-27')
          );
        case 'batch-tables':
          return (
            name.includes('TABLE') ||
            name.includes('VANITY') ||
            name.includes('SHELF') ||
            code.includes('TB-02') ||
            code.includes('TB-03') ||
            code.includes('OV-501') ||
            code.includes('OV-505')
          );
        case 'batch-millwork':
          return (
            name.includes('DOOR') ||
            name.includes('KUSEN') ||
            name.includes('COVER') ||
            name.includes('PARTITION') ||
            code.includes('ID-OV') ||
            code.includes('ID-BV')
          );
        case 'batch-cushions':
          return (
            name.includes('CUSHION') ||
            name.includes('BUSA') ||
            name.includes('KAIN') ||
            code.includes('AA-09') ||
            code.includes('AA-10') ||
            code.includes('AA-11') ||
            code.includes('AA-12')
          );
        default:
          return true;
      }
    });
  }, [items, currentView]);

  // 2. Search filtering
  const visibleItems = useMemo(() => {
    if (!searchTerm.trim()) return batchFilteredItems;
    const term = searchTerm.toLowerCase();
    return batchFilteredItems.filter((it) => {
      const code = (it.item_code || '').toLowerCase();
      const name = (it.item_name || '').toLowerCase();
      return code.includes(term) || name.includes(term);
    });
  }, [batchFilteredItems, searchTerm]);

  // 3. Batch Subtotal Calculations
  const batchStats = useMemo(() => {
    let pcs = 0;
    let hpp = 0;
    let selling = 0;
    let teakM3 = 0;
    let mindiM3 = 0;

    for (const it of batchFilteredItems) {
      // In room-specific batches, count the room's allocation quantity
      let q = it.project_qty || 1;
      if (currentView === 'batch-ov') {
        q = it.custom_columns?.room_distribution?.ov || q;
      } else if (currentView === 'batch-bv') {
        q = it.custom_columns?.room_distribution?.bv || q;
      }

      pcs += q;
      hpp += (it.unit_hpp || 0) * q;
      selling += (it.selling_price || 0) * q;

      for (const s of it.solid_components || []) {
        const v = ((s.l || 0) * (s.w || 0) * (s.t || 0) * (s.qty || 1) * q) / 1e9;
        if (s.material === 'MINDI') {
          mindiM3 += v;
        } else {
          teakM3 += v;
        }
      }
    }

    const avgUnitHpp = pcs > 0 ? hpp / pcs : 0;
    return { pcs, hpp, selling, teakM3, mindiM3, avgUnitHpp };
  }, [batchFilteredItems, currentView]);

  // 4. Breadcrumb title & description
  const viewMeta = useMemo(() => {
    switch (currentView) {
      case 'batch-ov':
        return {
          title: t('batchOV'),
          badge: 'Room Batch',
          desc: 'Furniture models scheduled for 91 Overwater Villas.',
        };
      case 'batch-bv':
        return {
          title: t('batchBV'),
          badge: 'Room Batch',
          desc: 'Furniture models scheduled for 31 Beach Villas.',
        };
      case 'batch-mirrors':
        return {
          title: t('batchMirrors'),
          badge: 'Category Batch',
          desc: 'Framed round mirrors, vanity mirrors, and full-length mirrors.',
        };
      case 'batch-seating':
        return {
          title: t('batchSeating'),
          badge: 'Category Batch',
          desc: 'Lounge armchairs, side chairs, stools, and luggage benches.',
        };
      case 'batch-tables':
        return {
          title: t('batchTables'),
          badge: 'Category Batch',
          desc: 'Side tables, wood stools, minibar cabinets, and vanity shelves.',
        };
      case 'batch-millwork':
        return {
          title: t('batchMillwork'),
          badge: 'Category Batch',
          desc: 'Bathroom doors, door frames, AC louver covers, and partitions.',
        };
      case 'batch-cushions':
        return {
          title: t('batchCushions'),
          badge: 'Category Batch',
          desc: 'Seat cushions, back cushions, outdoor upholstery, and fabric.',
        };
      case 'sawmill':
        return {
          title: t('sawmillSchedule'),
          badge: 'Factory Production',
          desc: t('sawmillSubtitle'),
        };
      case 'packing':
        return {
          title: t('logisticsPacking'),
          badge: 'Logistics',
          desc: t('logisticsSubtitle'),
        };
      default:
        return {
          title: t('allProjects'),
          badge: 'Full Project',
          desc: 'Complete overview of all 40 furniture models for Maldives Project.',
        };
    }
  }, [currentView, t]);

  return (
    <div className="flex flex-col gap-6">
      {/* NOTION-STYLE BREADCRUMBS & HEADER */}
      <div className="flex flex-col gap-1 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
          <span>PLV Maldives</span>
          <span>/</span>
          <span>Batches</span>
          <span>/</span>
          <span className="text-white font-medium">{viewMeta.title}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">{viewMeta.title}</h1>
            <span className="text-[10px] font-mono uppercase bg-surface-elevated text-accent-blue border border-border-subtle px-2 py-0.5 rounded font-semibold">
              {viewMeta.badge}
            </span>
          </div>

          <button
            onClick={onDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-elevated border border-border-subtle text-xs text-neutral-300 hover:text-white transition-all self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px] text-accent-blue">download</span>
            <span>{t('downloadTemplate')}</span>
          </button>
        </div>
        <p className="text-xs text-text-muted mt-0.5">{viewMeta.desc}</p>
      </div>

      {/* DEDICATED BATCH SUMMARY CARD (SUBTOTAL BANNER) */}
      <div className="bg-[#14181F] border border-border-subtle rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-accent-blue">analytics</span>
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              {t('batchSummaryTitle')}
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            {batchFilteredItems.length} {t('totalModels')}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-card p-3 rounded-lg border border-border-subtle flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-text-muted">{t('batchTotalPcs')}</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">{batchStats.pcs.toLocaleString()}</span>
              <span className="text-xs text-text-muted">units</span>
            </div>
          </div>

          <div className="bg-surface-card p-3 rounded-lg border border-border-subtle flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-text-muted">{t('batchTotalHpp')}</span>
            <div className="mt-1">
              <span className="text-lg lg:text-xl font-bold font-mono text-accent-yellow">
                {formatIDR(batchStats.hpp)}
              </span>
            </div>
          </div>

          <div className="bg-surface-card p-3 rounded-lg border border-border-subtle flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-text-muted">{t('batchAvgUnitCost')}</span>
            <div className="mt-1">
              <span className="text-lg lg:text-xl font-bold font-mono text-white">
                {formatIDR(batchStats.avgUnitHpp)}
              </span>
            </div>
          </div>

          <div className="bg-surface-card p-3 rounded-lg border border-border-subtle flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-text-muted">{t('timberDemand')}</span>
            <div className="mt-1 flex items-center justify-between text-xs font-mono">
              <span className="text-text-muted">{t('teak')}: <strong className="text-white">{batchStats.teakM3.toFixed(2)} m³</strong></span>
              <span className="text-text-muted">{t('mindi')}: <strong className="text-white">{batchStats.mindiM3.toFixed(2)} m³</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH TOOLBAR */}
      <div className="flex items-center justify-between gap-3 bg-surface-card border border-border-subtle p-2.5 rounded-xl">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <span className="material-symbols-outlined text-[18px] text-text-muted ml-1">search</span>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-white placeholder-text-muted focus:border-border-strong font-mono"
          />
        </div>

        <div className="text-xs font-mono text-text-muted px-2">
          {visibleItems.length} of {batchFilteredItems.length} items
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-elevated text-text-muted font-mono uppercase text-[11px]">
                <th className="py-3 px-3 w-14 text-center">{t('photo')}</th>
                <th className="py-3 px-3 w-32">{t('code')}</th>
                <th className="py-3 px-4 min-w-[220px]">{t('itemName')}</th>
                <th className="py-3 px-3 text-center">{t('allocation')}</th>
                <th className="py-3 px-3 text-center">{t('dimensions')}</th>
                <th className="py-3 px-4 text-right">{t('unitHpp')}</th>
                <th className="py-3 px-4 text-right">{t('totalHpp')}</th>
                <th className="py-3 px-4 text-right">{t('sellingPrice')}</th>
                <th className="py-3 px-3 text-center">{t('documents')}</th>
                <th className="py-3 px-3 text-center w-24">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-[11px]">
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-text-muted font-sans text-xs">
                    No items found matching your filter or search query.
                  </td>
                </tr>
              ) : (
                visibleItems.map((item, idx) => {
                  const photo = item.custom_columns?.photo_url;
                  const dwg = item.custom_columns?.dwg_link;
                  const spec = item.custom_columns?.spec_link;
                  const ov = item.custom_columns?.room_distribution?.ov || 0;
                  const bv = item.custom_columns?.room_distribution?.bv || 0;

                  // Quantity calculation based on current batch view
                  let displayQty = item.project_qty || 1;
                  if (currentView === 'batch-ov' && ov > 0) displayQty = ov;
                  else if (currentView === 'batch-bv' && bv > 0) displayQty = bv;

                  const totHpp = (item.unit_hpp || 0) * displayQty;

                  return (
                    <tr key={item.item_code || idx} className="hover:bg-surface-elevated/60 transition-colors">
                      {/* Thumbnail Photo */}
                      <td className="py-2 px-3 text-center">
                        {photo ? (
                          <button
                            onClick={() => setActivePhotoModal(photo)}
                            className="w-10 h-10 rounded border border-border-subtle overflow-hidden bg-surface-elevated flex items-center justify-center group relative hover:border-accent-blue transition-all mx-auto"
                            title="Click to zoom image"
                          >
                            <img src={photo} alt={item.item_code} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="material-symbols-outlined text-white text-[14px]">zoom_in</span>
                            </div>
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded border border-border-subtle bg-surface-elevated flex items-center justify-center text-text-muted mx-auto">
                            <span className="material-symbols-outlined text-[16px]">image_not_supported</span>
                          </div>
                        )}
                      </td>

                      {/* Item Code */}
                      <td className="py-3 px-3 font-semibold text-white">
                        <span className="bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle">
                          {item.item_code}
                        </span>
                      </td>

                      {/* Item Description */}
                      <td className="py-3 px-4 font-sans text-xs text-neutral-200">
                        <div className="font-medium text-white">{item.item_name}</div>
                        {item.custom_columns?.notes && (
                          <div className="text-[10px] text-text-muted mt-0.5 line-clamp-1 italic font-mono">
                            {item.custom_columns.notes}
                          </div>
                        )}
                      </td>

                      {/* Qty Allocation */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-white text-xs">{displayQty}</span>
                        <div className="text-[10px] text-text-muted flex justify-center gap-1 mt-0.5">
                          <span className="text-accent-blue font-semibold">OV:{ov}</span>
                          <span>•</span>
                          <span className="text-accent-green font-semibold">BV:{bv}</span>
                        </div>
                      </td>

                      {/* Overall Dimensions */}
                      <td className="py-3 px-3 text-center text-text-muted">
                        {item.overall_l && item.overall_w && item.overall_h
                          ? `${item.overall_l}×${item.overall_w}×${item.overall_h}`
                          : '-'}
                      </td>

                      {/* Unit HPP */}
                      <td className="py-3 px-4 text-right font-semibold text-accent-yellow">
                        {formatIDR(item.unit_hpp)}
                      </td>

                      {/* Total HPP */}
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {formatIDR(totHpp)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right text-accent-green font-medium">
                        {formatIDR(item.selling_price)}
                      </td>

                      {/* CAD & Specs */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {dwg ? (
                            <a
                              href={dwg}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded hover:bg-neutral-800 text-accent-blue transition-colors"
                              title="AutoCAD / Drawing File"
                            >
                              <span className="material-symbols-outlined text-[16px]">draw</span>
                            </a>
                          ) : null}
                          {spec ? (
                            <a
                              href={spec}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded hover:bg-neutral-800 text-accent-green transition-colors"
                              title="Specification Document"
                            >
                              <span className="material-symbols-outlined text-[16px]">description</span>
                            </a>
                          ) : null}
                          {!dwg && !spec && <span className="text-text-muted text-[10px]">-</span>}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onSelectItem(item.item_code)}
                          className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-accent-blue hover:text-black border border-border-subtle text-text-subtle text-xs font-sans transition-all flex items-center gap-1 mx-auto"
                        >
                          <span>{t('viewBreakdown')}</span>
                          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
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

      {/* PHOTO HIGH-RES MODAL */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActivePhotoModal(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-surface-card border border-border-strong rounded-xl p-2 overflow-hidden shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-all z-10"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <img
              src={activePhotoModal}
              alt="High-res preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
