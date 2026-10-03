/**
 * Types for the PLV BOM costing engine.
 *
 * Positions and column meanings follow docs/SPEC-costing-system.md C2.3-C2.8
 * (Input Template v2). Money is never rounded here: see CLAUDE.md rule 2.
 */

export type Species = "TEAK" | "MINDI" | "MERANTI" | "OTHER";

export type Tier = "A" | "A-CURVED" | "B" | "C" | "D";

export type YN = "Y" | "N";

/** C1.5 T1 (7 steps, with the NARROW step) vs C2.5 column N (no NARROW step). */
export type TierRuleVersion = "2026-09-29" | "2026-09-30";

export type Rates = Record<string, number>;

export type Norms = Record<string, number>;

/** Header block, template rows 1-7 (C2.3). */
export interface Header {
  item_code: string;
  item_name?: string;
  area?: string;
  project_qty?: number;
  finish_recipe?: string;
  flatpack?: YN;
  notes?: string;
  overall_l?: number;
  overall_w?: number;
  overall_h?: number;
  drawing_link?: string;
  spec_link?: string;
  photo_url?: string;
  revision?: string;
}

/** One packing box row, template rows 11-14 (C2.4). Blank qty counts as 1; may be fractional. */
export interface Box {
  box_no?: number;
  contents?: string;
  l?: number;
  w?: number;
  h?: number;
  qty?: number;
}

/** One solid-wood line, template rows 18-42 (C2.5). */
export interface SolidLine {
  line_no?: number;
  material?: Species | string;
  component?: string;
  l?: number;
  w?: number;
  t?: number;
  qty?: number;
  exposed?: YN;
  curved?: YN;
  tier_override?: Tier;
  note?: string;
  /**
   * The component is turned, laser-cut, powder-coated or upholstered
   * entirely outside, paid for as its own bought-in line — so the tier
   * rate's carpentry-labour component (baked in by `deriveRates`) would
   * double-charge in-house labour that was not actually done in-house
   * (EVIN-QUESTIONS Q-17, decided 2026-10-02). Default/undefined behaves
   * exactly as before: the full tier rate, LAB_CARP included.
   */
  worked_outside?: boolean;
}

/** One panel line, template rows 46-60 (C2.6), plus the 30 Sep SHEETS (manual) column. */
export interface PanelLine {
  line_no?: number;
  panel_type?: string;
  component?: string;
  l?: number;
  w?: number;
  t?: number;
  qty?: number;
  exposed_faces?: number;
  sheets_manual?: number;
  note?: string;
}

/** One hardware / bought-in line, template rows 64-78 (C2.7). */
export interface HardwareLine {
  line_no?: number;
  item_code?: string;
  description?: string;
  vendor?: string;
  qty?: number;
  uom?: string;
  unit_price?: number;
  note?: string;
}

export interface BomInput {
  header: Header;
  boxes?: Box[];
  solid?: SolidLine[];
  panels?: PanelLine[];
  hardware?: HardwareLine[];
}

export interface CostOptions {
  /** Tier rule variant. Default "2026-09-30". */
  tierRuleVersion?: TierRuleVersion;
}

export interface SolidLineResult {
  line_no: number;
  material: string | null;
  component: string | null;
  /** L x W x T / 1e9 x qty */
  vol_m3: number | null;
  /** L x W / 1e6 x qty */
  face_m2: number | null;
  auto_tier: Tier | null;
  /** auto_tier already honours tier_override (T1 step 1); kept for the UI. */
  tier: Tier | null;
  rate_code: string | null;
  rate_value: number | null;
  cost: number | null;
  check: string;
}

export interface PanelLineResult {
  line_no: number;
  panel_type: string | null;
  component: string | null;
  vol_m3: number | null;
  face_m2: number | null;
  /** P1: 0 means the panel does not fit on a sheet. */
  pieces_per_sheet: number | null;
  /** P2: fractional sheets (qty / pieces per sheet), or the manual sheet count. */
  sheets: number | null;
  /** P2: ROUNDUP(sheets). */
  sheets_whole: number | null;
  /** P2: 1 - (qty x L x W) / (whole x SHEET_L x SHEET_W). */
  waste: number | null;
  /** P3. */
  sheets_charged: number | null;
  rate_code: string | null;
  rate_value: number | null;
  /**
   * A panel bigger than one sheet in both orientations (EVIN-QUESTIONS
   * Q-11, decided 2026-10-02): the sheets needed to cover one panel,
   * joined together, times qty. Null when the panel fits one sheet.
   */
  joints: number | null;
  /** Joints x PANEL_JOINT. Null until that rate exists (check reads "joint rate?"). */
  joint_cost: number | null;
  /** P4. */
  cost: number | null;
  check: string;
}

export interface HardwareLineResult {
  line_no: number;
  item_code: string | null;
  description: string | null;
  qty: number | null;
  unit_price: number | null;
  cost: number | null;
}

/** K1 per box row. */
export interface BoxResult {
  box_no: number;
  contents: string | null;
  qty: number;
  carton_l: number;
  carton_w: number;
  carton_h: number;
  /** 2(LW + LH + WH) / 1e6 x qty */
  m2: number;
  /** L x W x H / 1e9 x qty */
  m3: number;
}

export interface PackingAggregate {
  rows: BoxResult[];
  /** TOTAL row G15. */
  cartons: number;
  /** TOTAL row L15, carton board m2 (6 sides). */
  m2: number;
  /** TOTAL row M15, carton m3. */
  m3: number;
  /** True when the box rows were blank and the overall size was used. */
  from_overall: boolean;
}

/** One row of the item summary block (C2.8, 30 Sep 18-line version). */
export interface SummaryLine {
  /** Row number on the item tab. */
  row: number;
  label: string;
  value: number;
}

export interface CostResult {
  item_code: string;
  tier_rule_version: TierRuleVersion;

  solid: SolidLineResult[];
  panels: PanelLineResult[];
  hardware: HardwareLineResult[];
  boxes: BoxResult[];

  // Aggregates (summary rows 82-86 + 97)
  solid_m3: number;
  panel_sheets: number;
  finishing_m2: number;
  cartons: number;
  carton_m3: number;
  carton_m2: number;

  // Cost lines
  timber: number;
  /** C4.3 split of TIMBER: component m3 x (tier rate - LAB_CARP). */
  timber_wood_processing: number;
  /** C4.3 split of TIMBER: component m3 x LAB_CARP. */
  carpentry_labour: number;
  fasteners: number;
  panels_cost: number;
  fin_mat: number;
  sand_mat: number;
  sand_lab: number;
  fin_lab: number;
  /** The four finishing lines added up. */
  finishing: number;
  hardware_cost: number;
  packing: number;
  direct: number;
  misc: number;
  overhead: number;
  unit_cost: number;
  project_total: number;

  /** The 18 summary lines in sheet order, plus the two extra rows. */
  summary: SummaryLine[];

  /** Every non-OK check message, in line order. */
  checks: string[];
  /** True when every filled line reads OK. */
  ok: boolean;
}
