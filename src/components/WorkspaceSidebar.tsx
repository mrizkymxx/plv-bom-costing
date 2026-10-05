'use client';

import React from 'react';
import { useTranslation, Language } from '@/lib/i18n';

export type WorkspaceView =
  | 'all'
  | 'batch-ov'
  | 'batch-bv'
  | 'batch-mirrors'
  | 'batch-seating'
  | 'batch-tables'
  | 'batch-millwork'
  | 'batch-cushions'
  | 'sawmill'
  | 'packing'
  | 'rates';

interface WorkspaceSidebarProps {
  currentView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  counts: Record<string, number>;
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenCloudSync: () => void;
  onDownloadTemplate: () => void;
}

export default function WorkspaceSidebar({
  currentView,
  onSelectView,
  counts,
  isOpen,
  onToggleOpen,
  onOpenCloudSync,
  onDownloadTemplate,
}: WorkspaceSidebarProps) {
  const { language, setLanguage, t } = useTranslation();

  const navItems = [
    {
      group: t('workspace'),
      items: [
        { id: 'all' as WorkspaceView, label: t('allProjects'), icon: 'table_rows', count: counts.all || 40 },
        { id: 'sawmill' as WorkspaceView, label: t('sawmillSchedule'), icon: 'carpenter' },
        { id: 'packing' as WorkspaceView, label: t('logisticsPacking'), icon: 'package_2' },
      ],
    },
    {
      group: t('batches'),
      items: [
        { id: 'batch-ov' as WorkspaceView, label: t('batchOV'), icon: 'water', count: counts.ov || 0, badgeColor: 'text-accent-blue' },
        { id: 'batch-bv' as WorkspaceView, label: t('batchBV'), icon: 'beach_access', count: counts.bv || 0, badgeColor: 'text-accent-green' },
        { id: 'batch-mirrors' as WorkspaceView, label: t('batchMirrors'), icon: 'crop_portrait', count: counts.mirrors || 0 },
        { id: 'batch-seating' as WorkspaceView, label: t('batchSeating'), icon: 'chair', count: counts.seating || 0 },
        { id: 'batch-tables' as WorkspaceView, label: t('batchTables'), icon: 'table_restaurant', count: counts.tables || 0 },
        { id: 'batch-millwork' as WorkspaceView, label: t('batchMillwork'), icon: 'door_front', count: counts.millwork || 0 },
        { id: 'batch-cushions' as WorkspaceView, label: t('batchCushions'), icon: 'airline_seat_recline_extra', count: counts.cushions || 0 },
      ],
    },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-surface-card border border-border-subtle text-neutral-300 hover:text-white shadow-lg lg:hidden"
        title="Open Sidebar"
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>
    );
  }

  return (
    <aside className="w-64 h-screen bg-[#14181F] border-r border-border-subtle flex flex-col shrink-0 select-none z-30">
      {/* Workspace Brand Header */}
      <div className="p-3.5 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-surface-elevated border border-border-strong flex items-center justify-center font-mono font-bold text-white text-xs">
            PLV
          </div>
          <div className="flex flex-col">
            <h2 className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
              <span>Maldives Project</span>
              <span className="text-[9px] font-mono uppercase bg-accent-blue/15 text-accent-blue border border-accent-blue/30 px-1 rounded">
                BOM
              </span>
            </h2>
            <span className="text-[10px] text-text-muted font-sans line-clamp-1">STMV Actuals Costing</span>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          className="lg:hidden text-text-muted hover:text-white p-1"
          title="Close Sidebar"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto custom-scroll p-3 flex flex-col gap-5">
        {navItems.map((section, sIdx) => (
          <div key={sIdx} className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1">
              {section.group}
            </span>
            {section.items.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`material-symbols-outlined text-[17px] ${
                        isActive ? 'text-accent-blue' : 'text-neutral-500 group-hover:text-neutral-300'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-neutral-700 text-white'
                          : 'bg-neutral-900 text-neutral-500 group-hover:text-neutral-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Master Rates & Tools */}
        <div className="flex flex-col gap-1 pt-2 border-t border-border-subtle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 py-1">
            SYSTEM & RATES
          </span>
          <button
            onClick={() => onSelectView('rates')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'rates'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-accent-yellow">tune</span>
              <span>{t('masterRates')}</span>
            </div>
            <span className="text-[9px] font-mono bg-neutral-800 text-text-muted px-1.5 py-0.5 rounded">27 fig</span>
          </button>

          <button
            onClick={onDownloadTemplate}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/40 transition-all text-left"
          >
            <span className="material-symbols-outlined text-[17px] text-accent-blue">download</span>
            <span>{t('downloadTemplate')}</span>
          </button>

          <button
            onClick={onOpenCloudSync}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/40 transition-all text-left"
          >
            <span className="material-symbols-outlined text-[17px] text-emerald-400">cloud_sync</span>
            <span>{t('cloudSync')}</span>
          </button>
        </div>
      </div>

      {/* Footer: Language Switcher */}
      <div className="p-3 border-t border-border-subtle flex items-center justify-between bg-[#0F1318]">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-neutral-400">language</span>
          <span className="text-xs text-neutral-400 font-sans">Language</span>
        </div>

        <div className="flex items-center bg-surface-elevated p-0.5 rounded border border-border-subtle">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 text-[11px] font-mono rounded font-semibold transition-all ${
              language === 'en' ? 'bg-accent-blue text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('id')}
            className={`px-2 py-0.5 text-[11px] font-mono rounded font-semibold transition-all ${
              language === 'id' ? 'bg-accent-blue text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            ID
          </button>
        </div>
      </div>
    </aside>
  );
}
