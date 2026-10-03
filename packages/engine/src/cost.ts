/**
 * costItem — rules T2, T3, H1, K2, A1-A4 wired together.
 * Summary layout: C2.8, 30 Sep 18-line version.
 */

import { finishingCost, finishingM2 } from "./finishing";
import { rateOf } from "./lookup";
import { computePacking, packingCost } from "./packing";
import { computePanel } from "./panel";
import { autoTier, solidRateCode } from "./tier";
import type {
  BomInput,
  CostOptions,
  CostResult,
  HardwareLineResult,
  Norms,
  Rates,
  SolidLine,
  SolidLineResult,
  SummaryLine,
} from "./types";

function filled(v: unknown): boolean {
  return v !== undefined && v !== null && v !== "";
}

/** CHECK column of the solid block, C2.5 column Q (verbatim messages). */
function solidCheck(line: SolidLine): string {
  if (!filled(line.l)) return "";
  if (!filled(line.material)) return "material?";
  if (!filled(line.exposed)) return "exposed Y/N?";
  if (!filled(line.qty)) return "qty?";
  return "OK";
}

function computeSolid(
  line: SolidLine,
  rates: Rates,
  norms: Norms,
  version: CostOptions["tierRuleVersion"],
  lineNo: number,
): SolidLineResult {
  const qty = line.qty ?? 1;
  const tier = autoTier(line, norms, version);
  const hasDims = filled(line.l) && filled(line.w) && filled(line.t);

  const result: SolidLineResult = {
    line_no: lineNo,
    material: line.material ?? null,
    component: line.component ?? null,
    vol_m3: hasDims ? ((line.l as number) * (line.w as number) * (line.t as number)) / 1e9 * qty : null,
    face_m2: filled(line.l) && filled(line.w) ? ((line.l as number) * (line.w as number)) / 1e6 * qty : null,
    auto_tier: tier,
    tier,
    rate_code: solidRateCode(line.material, tier),
    rate_value: null,
    cost: null,
    check: solidCheck(line),
  };

  if (result.rate_code) {
    const rate = rates[result.rate_code];
    if (rate === undefined) {
      // C2.5 column R: rate lookup failure shows "rate?" (e.g. species OTHER).
      if (result.check === "OK") result.check = "rate?";
    } else {
      // Worked entirely outside (Q-17): strip the carpentry-labour component
      // the tier rate otherwise bakes in, since that labour is paid for
      // again as its own bought-in line.
      const effectiveRate = line.worked_outside ? rate - rateOf(rates, "LAB_CARP") : rate;
      result.rate_value = effectiveRate;
      // T2 — cost = component m3 x rate[species, tier]
      if (result.vol_m3 !== null) result.cost = result.vol_m3 * effectiveRate;
    }
  }

  return result;
}

export function costItem(
  input: BomInput,
  rates: Rates,
  norms: Norms,
  options: CostOptions = {},
): CostResult {
  const version = options.tierRuleVersion ?? "2026-09-30";
  const solidLines = input.solid ?? [];
  const panelLines = input.panels ?? [];
  const hardwareLines = input.hardware ?? [];
  const boxLines = input.boxes ?? [];

  const solid = solidLines.map((l, i) => computeSolid(l, rates, norms, version, l.line_no ?? i + 1));
  const panels = panelLines.map((l, i) => computePanel(l, rates, norms, l.line_no ?? i + 1));

  // H1 — qty x vendor price
  const hardware: HardwareLineResult[] = hardwareLines.map((l, i) => ({
    line_no: l.line_no ?? i + 1,
    item_code: l.item_code ?? null,
    description: l.description ?? null,
    qty: l.qty ?? null,
    unit_price: l.unit_price ?? null,
    cost: filled(l.qty) && filled(l.unit_price) ? (l.qty as number) * (l.unit_price as number) : null,
  }));

  const packingAgg = computePacking(input.header, boxLines, norms);

  // Summary rows 82-86
  const solid_m3 = solid.reduce((s, r) => s + (r.vol_m3 ?? 0), 0);
  const panel_sheets = panels.reduce((s, r) => s + (r.sheets ?? 0), 0);
  const finishing_m2 = finishingM2(solidLines, panelLines, norms);
  const cartons = packingAgg.cartons;
  const carton_m3 = packingAgg.m3;
  const carton_m2 = packingAgg.m2;

  // Cost lines
  const timber = solid.reduce((s, r) => s + (r.cost ?? 0), 0);
  // C4.3 reports TIMBER split into wood + processing and carpentry labour.
  // A line worked entirely outside (Q-17) contributes no in-house carpentry
  // labour, so it is excluded from this sum (its tier rate already excludes
  // LAB_CARP — see computeSolid).
  const carpentry_labour = solidLines.reduce(
    (s, l, i) => s + (l.worked_outside ? 0 : (solid[i]?.vol_m3 ?? 0)),
    0,
  ) * rateOf(rates, "LAB_CARP");
  const timber_wood_processing = timber - carpentry_labour;

  // T3 — sum of component m3 (all species) x FASTENERS
  const fasteners = solid_m3 * rateOf(rates, "FASTENERS");

  const panels_cost = panels.reduce((s, r) => s + (r.cost ?? 0), 0);

  const fin = finishingCost(finishing_m2, rates);
  const hardware_cost = hardware.reduce((s, r) => s + (r.cost ?? 0), 0);
  const packing = packingCost(packingAgg, rates, norms);

  // A1-A4
  const direct =
    timber + fasteners + panels_cost + fin.fin_mat + fin.sand_mat + fin.sand_lab + fin.fin_lab +
    hardware_cost + packing;
  const misc = direct * rateOf(rates, "MISC_PCT");
  const overhead = (direct + misc) * rateOf(rates, "OH_PCT");
  const unit_cost = direct + misc + overhead;
  const project_total = (input.header.project_qty ?? 0) * unit_cost;

  const summary: SummaryLine[] = [
    { row: 82, label: "Solid wood m3", value: solid_m3 },
    { row: 83, label: "Panel sheets", value: panel_sheets },
    { row: 84, label: "Finishing m2 (exposed)", value: finishing_m2 },
    { row: 85, label: "Cartons", value: cartons },
    { row: 86, label: "Carton m3", value: carton_m3 },
    { row: 87, label: "TIMBER", value: timber },
    { row: 88, label: "FASTENERS", value: fasteners },
    { row: 89, label: "PANELS", value: panels_cost },
    { row: 90, label: "FINISHING MATERIALS", value: fin.fin_mat },
    { row: 91, label: "SANDING MATERIALS", value: fin.sand_mat },
    { row: 92, label: "SANDING LABOUR", value: fin.sand_lab },
    { row: 93, label: "FINISHING LABOUR", value: fin.fin_lab },
    { row: 94, label: "HARDWARE", value: hardware_cost },
    { row: 95, label: "PACKING", value: packing },
    { row: 96, label: "DIRECT COST", value: direct },
    { row: 97, label: "MISC 5%", value: misc },
    { row: 98, label: "OVERHEAD", value: overhead },
    { row: 99, label: "UNIT COST IDR", value: unit_cost },
    { row: 100, label: "Carton board m2 (6 sides)", value: carton_m2 },
    { row: 101, label: "PROJECT QTY x UNIT COST", value: project_total },
  ];

  const checks = [...solid, ...panels]
    .map((r) => r.check)
    .filter((c) => c !== "" && c !== "OK");

  return {
    item_code: input.header.item_code,
    tier_rule_version: version,
    solid,
    panels,
    hardware,
    boxes: packingAgg.rows,
    solid_m3,
    panel_sheets,
    finishing_m2,
    cartons,
    carton_m3,
    carton_m2,
    timber,
    timber_wood_processing,
    carpentry_labour,
    fasteners,
    panels_cost,
    fin_mat: fin.fin_mat,
    sand_mat: fin.sand_mat,
    sand_lab: fin.sand_lab,
    fin_lab: fin.fin_lab,
    finishing: fin.total,
    hardware_cost,
    packing,
    direct,
    misc,
    overhead,
    unit_cost,
    project_total,
    summary,
    checks,
    ok: checks.length === 0,
  };
}
