'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'id';

export const DICTIONARY = {
  // Brand & Header
  appTitle: {
    en: 'Costing Workspace',
    id: 'Workspace Estimasi Biaya',
  },
  appSubtitle: {
    en: 'Furniture Manufacturing Costing Engine',
    id: 'Engine Kalkulasi HPP & Biaya Produksi',
  },
  searchPlaceholder: {
    en: 'Search model, code, or material...',
    id: 'Cari model, kode, atau material...',
  },

  // Navigation & Sidebar
  workspace: {
    en: 'WORKSPACE',
    id: 'WORKSPACE',
  },
  allProjects: {
    en: 'All Items & Overview',
    id: 'Semua Item & Ringkasan',
  },
  batches: {
    en: 'BATCHES / ROOM ZONES',
    id: 'BATCH / ZONA RUANGAN',
  },
  batchAll: {
    en: 'Complete Project (All Batches)',
    id: 'Seluruh Proyek (Semua Batch)',
  },
  batchOV: {
    en: 'Overwater Villa (OV)',
    id: 'Overwater Villa (OV)',
  },
  batchBV: {
    en: 'Beach Villa (BV)',
    id: 'Beach Villa (BV)',
  },
  batchMirrors: {
    en: 'Mirrors & Glasswork',
    id: 'Cermin & Kaca',
  },
  batchSeating: {
    en: 'Chairs & Stools',
    id: 'Kursi & Stool',
  },
  batchTables: {
    en: 'Tables & Vanities',
    id: 'Meja & Wastafel',
  },
  batchMillwork: {
    en: 'Doors, Kusen & Covers',
    id: 'Pintu, Kusen & Cover AC',
  },
  batchCushions: {
    en: 'Cushions & Soft Goods',
    id: 'Busa & Kain Cushion',
  },
  masterRates: {
    en: 'Master Rate Card',
    id: 'Tabel Tarif Dasar',
  },
  cloudSync: {
    en: 'Cloud Database',
    id: 'Database Cloud',
  },
  revisionControl: {
    en: 'Revision History',
    id: 'Riwayat Revisi',
  },

  // Actions
  downloadTemplate: {
    en: 'Excel Template',
    id: 'Template Excel',
  },
  uploadExcel: {
    en: 'Upload Excel',
    id: 'Unggah Excel',
  },
  exportExcel: {
    en: 'Export Cost Sheet',
    id: 'Ekspor Rincian Biaya',
  },
  viewBreakdown: {
    en: 'View Cost Breakdown',
    id: 'Lihat Rincian Biaya',
  },
  backToProject: {
    en: 'Back to Project',
    id: 'Kembali ke Proyek',
  },
  locked: {
    en: 'Locked (Rev 1)',
    id: 'Terkunci (Rev 1)',
  },
  unlocked: {
    en: 'Unlocked (Draft)',
    id: 'Terbuka (Draft)',
  },

  // KPI Cards
  totalModels: {
    en: 'Furniture Models',
    id: 'Model Furnitur',
  },
  totalPcs: {
    en: 'Total Production Units',
    id: 'Total Jumlah Produksi',
  },
  totalHpp: {
    en: 'Project Total Cost (HPP)',
    id: 'Total HPP Proyek',
  },
  totalSelling: {
    en: 'Target Selling Value',
    id: 'Target Nilai Jual',
  },
  unitHpp: {
    en: 'Unit Cost (HPP)',
    id: 'HPP per Satuan',
  },
  sellingPrice: {
    en: 'Selling Price',
    id: 'Harga Jual',
  },
  targetMargin: {
    en: 'Profit Margin',
    id: 'Margin Keuntungan',
  },
  timberDemand: {
    en: 'Raw Solid Timber Demand',
    id: 'Kebutuhan Kayu Solid',
  },
  teak: {
    en: 'Teak (Jati)',
    id: 'Jati',
  },
  mindi: {
    en: 'Mindi',
    id: 'Mindi',
  },

  // Sawmill & Logistics
  sawmillSchedule: {
    en: 'Sawmill Log Schedule (Cutting Thickness)',
    id: 'Rencana Belah Sawmill (Tebal Balok)',
  },
  sawmillSubtitle: {
    en: 'Factory raw log cutting distribution by component thickness',
    id: 'Distribusi tebal gergaji log kayu berdasarkan tebal part',
  },
  belah25: {
    en: '25mm Board',
    id: 'Papan Belah 25mm',
  },
  belah40: {
    en: '40mm Board',
    id: 'Papan Belah 40mm',
  },
  belah45: {
    en: '45mm Beam',
    id: 'Balok Belah 45mm',
  },
  belah50: {
    en: '50mm+ Timber',
    id: 'Balok Belah 50mm+',
  },
  logisticsPacking: {
    en: 'Packaging & Logistics Requirement',
    id: 'Kebutuhan Kemasan & Logistik',
  },
  logisticsSubtitle: {
    en: 'Corrugated cartons versus wooden export crates',
    id: 'Karton kardus box vs peti kayu ekspor',
  },
  cartonBoxes: {
    en: 'Corrugated Carton Boxes',
    id: 'Karton Corrugated Box',
  },
  woodenCrates: {
    en: 'Open Wooden Crates',
    id: 'Peti Kayu (Open Crate)',
  },

  // Table Headers
  photo: {
    en: 'Photo',
    id: 'Foto',
  },
  code: {
    en: 'Item Code',
    id: 'Kode Item',
  },
  itemName: {
    en: 'Model Description',
    id: 'Nama & Deskripsi Model',
  },
  allocation: {
    en: 'Qty Allocation',
    id: 'Alokasi Qty',
  },
  dimensions: {
    en: 'Overall (L×W×H)',
    id: 'Ukuran (P×L×T)',
  },
  documents: {
    en: 'CAD / Specs',
    id: 'CAD / Spek',
  },
  actions: {
    en: 'Action',
    id: 'Aksi',
  },

  // Breakdown Tabs & Cost Components
  costBreakdown: {
    en: 'Cost Breakdown',
    id: 'Rincian Komponen Biaya',
  },
  solidWood: {
    en: 'Solid Wood Parts',
    id: 'Kayu Solid',
  },
  panels: {
    en: 'Panel & Plywood',
    id: 'Triplek & Panel',
  },
  hardware: {
    en: 'Hardware & Fittings',
    id: 'Baut & Aksesoris',
  },
  subcontract: {
    en: 'Subcontract Services',
    id: 'Jasa Subkon & Bubut',
  },
  upholstery: {
    en: 'Cushions & Fabric',
    id: 'Busa & Kain',
  },
  packaging: {
    en: 'Carton & Packing',
    id: 'Kemasan & Packing',
  },
  finishing: {
    en: 'Finishing & Sanding',
    id: 'Finishing & Amplas',
  },
  directCost: {
    en: 'Direct Manufacturing Cost',
    id: 'Biaya Langsung Produksi',
  },
  overhead: {
    en: 'Factory Overhead (12.99%)',
    id: 'Overhead Pabrik (12.99%)',
  },
  misc: {
    en: 'Contingency / Misc (5%)',
    id: 'Biaya Tak Terduga (5%)',
  },

  // Batch Summary Banner
  batchSummaryTitle: {
    en: 'Batch Summary & Breakdown',
    id: 'Ringkasan Biaya Subtotal Batch',
  },
  batchTotalPcs: {
    en: 'Batch Production Qty',
    id: 'Jumlah Pesanan Batch',
  },
  batchTotalHpp: {
    en: 'Batch Total Cost',
    id: 'Total Biaya Batch',
  },
  batchAvgUnitCost: {
    en: 'Average Unit Cost',
    id: 'Rata-rata Biaya / Unit',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof DICTIONARY) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => DICTIONARY[key]?.en || String(key),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('plv_language') as Language;
      if (saved === 'en' || saved === 'id') {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('plv_language', lang);
    }
  };

  const t = (key: keyof typeof DICTIONARY): string => {
    const entry = DICTIONARY[key];
    if (!entry) return String(key);
    return entry[language] || entry.en;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
