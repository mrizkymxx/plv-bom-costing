import { costItem, deriveRates, derivePanelRates } from "../src/index";
import type {
  BomInput,
  CostResult,
  Norms,
  PanelRateInputs,
  RateInputs,
  TierRuleVersion,
} from "../src/index";
import rateInputs from "../fixtures/rate-inputs-2026-09-29.json";
import panelRateInputs from "../fixtures/panel-rate-inputs-2026-09-29.json";
import normsJson from "../fixtures/norms-2026-09-30.json";
import stack12 from "../fixtures/stack12-2026-09-30.json";

const norms = normsJson as unknown as Norms;
const rates = {
  ...deriveRates(rateInputs as unknown as RateInputs, norms),
  ...derivePanelRates(panelRateInputs as unknown as PanelRateInputs),
};

interface SolidRef {
  tier: string | null;
  rate: number | null;
  cost: number | null;
}

interface PanelRef {
  sheets: number | null;
  rate: number | null;
  cost: number | null;
}

interface StackItem {
  tab: string;
  input: BomInput;
  ref: {
    summary: Record<string, number>;
    solid: SolidRef[];
    panels: PanelRef[];
  };
}

const ITEMS = stack12 as unknown as StackItem[];

const TIER_RULE: TierRuleVersion = "2026-09-30";

/**
 * C2.8 summary row labels, as the 30 Sep workbook prints them, mapped to the
 * CostResult field that should match them (C4.3 per-line values).
 */
const COST_LINES: Array<[string, keyof CostResult]> = [
  ["UNIT COST IDR", "unit_cost"],
  ["DIRECT COST", "direct"],
  ["MISC 5%", "misc"],
  ["OVERHEAD", "overhead"],
  ["TIMBER", "timber"],
  ["FASTENERS", "fasteners"],
  ["PANELS", "panels_cost"],
  ["FINISHING MATERIALS", "fin_mat"],
  ["SANDING MATERIALS", "sand_mat"],
  ["SANDING LABOUR", "sand_lab"],
  ["FINISHING LABOUR", "fin_lab"],
  ["HARDWARE", "hardware_cost"],
  ["PACKING", "packing"],
];

const PRECISE_LINES: Array<[string, keyof CostResult]> = [
  ["Solid wood m³", "solid_m3"],
  ["Panel sheets", "panel_sheets"],
  ["Finishing m² (exposed)", "finishing_m2"],
];

describe.each(ITEMS.map((it) => [it.tab, it] as const))(
  "C4.6 stack12 — %s (tier rule 2026-09-30)",
  (_tab, item) => {
    const r = costItem(item.input, rates, norms, { tierRuleVersion: TIER_RULE });

    test.each(COST_LINES)("%s matches the sheet within 0.5 IDR", (label, field) => {
      const expected = item.ref.summary[label];
      expect(expected).not.toBeUndefined();
      expect(Math.abs((r[field] as number) - expected!)).toBeLessThanOrEqual(0.5);
    });

    test.each(PRECISE_LINES)("%s matches the sheet to 1e-6", (label, field) => {
      const expected = item.ref.summary[label];
      expect(expected).not.toBeUndefined();
      expect(r[field] as number).toBeCloseTo(expected!, 6);
    });

    const solidCases = (item.input.solid ?? []).map((s, i) => ({
      i,
      label: `${i + 1} ${s.component ?? ""}`,
    }));

    test.each(solidCases)("solid line $label — tier matches the sheet", ({ i }) => {
      expect(r.solid[i]!.tier).toBe(item.ref.solid[i]!.tier);
    });

    test.each(solidCases)("solid line $label — cost matches the sheet within 0.5 IDR", ({ i }) => {
      const expected = item.ref.solid[i]!.cost!;
      expect(Math.abs(r.solid[i]!.cost! - expected)).toBeLessThanOrEqual(0.5);
    });

    const panelCases = (item.input.panels ?? []).map((p, i) => ({
      i,
      label: `${i + 1} ${p.component ?? ""}`,
    }));

    test.each(panelCases)("panel line $label — cost matches the sheet within 0.5 IDR", ({ i }) => {
      const expected = item.ref.panels[i]!.cost!;
      expect(Math.abs(r.panels[i]!.cost! - expected)).toBeLessThanOrEqual(0.5);
    });

    test("every filled line reads OK", () => {
      expect(r.checks).toEqual([]);
      expect(r.ok).toBe(true);
    });
  },
);
