-- ============================================================================
-- PLV BOM COSTING & RATE CARD COCKPIT - SUPABASE SCHEMA (PROJECT bjkjahetvxnimchkunqp)
-- ============================================================================

-- 1. Table: Rate Card Items (27 Base Figures + Derived Rates + Custom Parameters)
-- Implements Rule 7: Never update in-place; track valid_from, valid_to, and version.
CREATE TABLE IF NOT EXISTS public.rate_card_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode TEXT NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    kategori TEXT NOT NULL,
    nama TEXT NOT NULL,
    satuan TEXT NOT NULL,
    nilai NUMERIC NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    valid_from TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    valid_to TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table: Master Hardware Catalogue (Supports empty prices / TBD)
CREATE TABLE IF NOT EXISTS public.hardware_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    vendor TEXT,
    uom TEXT DEFAULT 'pcs' NOT NULL,
    unit_price NUMERIC, -- NULL if TBD / not yet priced
    status TEXT DEFAULT 'ACTIVE' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table: BOM Items (Cutlist components, HPP, Selling Price, Revisioning)
CREATE TABLE IF NOT EXISTS public.bom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code TEXT NOT NULL UNIQUE,
    item_name TEXT NOT NULL,
    project_qty INTEGER DEFAULT 1 NOT NULL,
    overall_l NUMERIC,
    overall_w NUMERIC,
    overall_h NUMERIC,
    finish_recipe TEXT DEFAULT 'NC NATURAL',
    status TEXT DEFAULT 'DRAFT' NOT NULL, -- 'DRAFT' | 'LOCKED'
    version INTEGER DEFAULT 1 NOT NULL,
    revision_note TEXT,
    target_margin NUMERIC DEFAULT 30 NOT NULL,
    unit_hpp NUMERIC DEFAULT 0 NOT NULL,
    selling_price NUMERIC DEFAULT 0 NOT NULL,
    
    -- JSONB blocks for full cutlist preservation
    solid_components JSONB DEFAULT '[]'::jsonb NOT NULL,
    panel_components JSONB DEFAULT '[]'::jsonb NOT NULL,
    hardware_components JSONB DEFAULT '[]'::jsonb NOT NULL,
    custom_components JSONB DEFAULT '[]'::jsonb NOT NULL,
    box_components JSONB DEFAULT '[]'::jsonb NOT NULL,
    custom_columns JSONB DEFAULT '[]'::jsonb NOT NULL,
    locked_snapshot JSONB,
    
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.rate_card_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read rate_card_items" ON public.rate_card_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert rate_card_items" ON public.rate_card_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update rate_card_items" ON public.rate_card_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete rate_card_items" ON public.rate_card_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read hardware_catalog" ON public.hardware_catalog FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert hardware_catalog" ON public.hardware_catalog FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update hardware_catalog" ON public.hardware_catalog FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete hardware_catalog" ON public.hardware_catalog FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read bom_items" ON public.bom_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert bom_items" ON public.bom_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update bom_items" ON public.bom_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete bom_items" ON public.bom_items FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Seed Benchmark Rates (Keputusan Owner 2 Okt: Jati 6M, Mindi 3M, Fin 6-Muka)
INSERT INTO public.rate_card_items (kode, kategori, nama, satuan, nilai, is_custom) VALUES
('LOG_TEAK', 'Kayu Solid', 'Log Jati Implied Base (Q-5)', 'IDR/m3', 6000000, false),
('LOG_MINDI', 'Kayu Solid', 'Log Mindi Implied Base (Q-5)', 'IDR/m3', 3000000, false),
('MERANTI_SAWN', 'Kayu Solid', 'Meranti Sawn Timber', 'IDR/m3', 8500000, false),
('PROCESSING', 'Kayu Solid', 'Kiln + Sawmill Processing', 'IDR/m3', 598978, false),
('LAB_CARP', 'Kayu Solid', 'Upah Tukang Kayu per m3 Komponen', 'IDR/m3', 7467983, false),
('FASTENERS', 'Kayu Solid', 'Pool Fasteners & Lem per m3', 'IDR/m3', 1750614, false),
('PLY_18_RAW', 'Panel & Sheet', 'Raw Plywood 18mm', 'IDR/lbr', 295000, false),
('PLY_18_TDF', 'Panel & Sheet', 'Plywood 18mm Teak 2-Muka', 'IDR/lbr', 1021346, false),
('PLY_15_TDF', 'Panel & Sheet', 'Plywood 15mm Teak 2-Muka', 'IDR/lbr', 986346, false),
('FIN_MAT', 'Finishing', 'Bahan Cat & Chemical Finishing', 'IDR/m2', 38845, false),
('SAND_MAT', 'Finishing', 'Amplas & Abrasives', 'IDR/m2', 12795, false),
('SAND_LAB', 'Finishing', 'Upah Tenaga Gosok Amplas', 'IDR/m2', 39477, false),
('FIN_LAB', 'Finishing', 'Upah Tenaga Semprot Finishing', 'IDR/m2', 88755, false),
('FIN_ALL', 'Finishing', 'Total Flat Finishing 6-Muka (Q-2)', 'IDR/m2', 179871, false),
('CARTON_M2', 'Packaging', 'Karton Corrugated Sheet', 'IDR/m2', 42000, false),
('PACK_LAB', 'Packaging', 'Upah Tenaga Packing', 'IDR/m3', 100000, false),
('GRP_A', 'Packaging', 'Karton Group A Flat Rate Minimal', 'IDR/unit', 24000, false),
('MISC_PCT', 'Overhead', 'Miscellaneous Markup Buffer', 'persen', 5.0, false),
('OH_PCT', 'Overhead', 'Factory Overhead Denominator (Q-4)', 'persen', 12.99287, false)
ON CONFLICT (kode) DO UPDATE SET nilai = EXCLUDED.nilai, updated_at = now();

-- 6. Seed Master Hardware Catalogue (Includes Empty Prices / TBD)
INSERT INTO public.hardware_catalog (code, description, vendor, uom, unit_price) VALUES
('I-00001', 'NANASAN + BAUT JCBC SST', 'Standard', 'pcs', 3500),
('I-00002', 'PLAT SIKU SST', 'Standard', 'pcs', 6000),
('I-00003', 'Nylon glides 25 mm', 'Standard', 'pcs', 1500),
('I-00004', 'Hinge, concealed, soft close 35 mm', 'Hafele', 'pcs', 28000),
('I-00005', 'Hinge, butt brass 50 mm', 'Solid Brass', 'pcs', 17500),
('I-00006', 'Drawer slide, ball bearing 450 mm', 'Dekkson', 'set', 85000),
('I-00007', 'Mirror 5 mm, cut to size', 'Asahimas', 'm2', 265000),
('I-00008', 'Handle, solid brass 128 mm', 'Custom', 'pcs', 95000),
('I-00009', 'Magnetic catch', 'Standard', 'pcs', 6500),
('I-00010', 'Shelf support pin 5 mm SST', 'Standard', 'pcs', 1200),
('I-00011', 'Engsel Pivot Custom (TBD)', 'Bengkel Luar', 'set', NULL),
('I-00012', 'Kunci Laci Central (TBD)', 'Vendor Toko', 'pcs', NULL)
ON CONFLICT (code) DO UPDATE SET unit_price = EXCLUDED.unit_price, updated_at = now();
