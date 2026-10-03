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
import panelInputs from "../fixtures/panel-inputs-2026-09-29.json";
import normsJson from "../fixtures/norms-2026-09-30.json";
import ov505b from "../fixtures/ov-505b.json";
import idOv506 from "../fixtures/id-ov-506.json";
import tb02 from "../fixtures/tb-02.json";
import aa04b from "../fixtures/aa-04b.json";

const norms = normsJson as unknown as Norms;
// The 35 PLY-<t>-<face> sheet prices join the rate card here: AA-04B is the
// first fixture with a panel line, and no other fixture carries panels.
const rates = {
  ...deriveRates(rateInputs as unknown as RateInputs, norms),
  ...derivePanelRates(panelInputs as unknown as PanelRateInputs),
};

const OV505B = ov505b as unknown as BomInput;
const IDOV506 = idOv506 as unknown as BomInput;
const TB02 = tb02 as unknown as BomInput;
const AA04B = aa04b as unknown as BomInput;

function cost(item: BomInput, tierRuleVersion: TierRuleVersion): CostResult {
  return costItem(item, rates, norms, { tierRuleVersion });
}

/**
 * Expected per-line values, C4.3 "3. NEW ESTIMATE PER UNIT, BY LINE".
 * Header row: Unit cost · Timber (wood + processing) · Carpentry labour · Panels ·
 * Finishing materials · Sanding materials · Sanding labour · Finishing labour ·
 * Bought-in + outside labour · Fasteners · Packing · Misc · Overhead.
 * "-" in the table is zero. DIRECT COST is not a C4.3 column; it is the sum of
 * the ten cost lines above Misc (summary row 96).
 */
interface ExpectedLines {
  unit_cost: number;
  timber_wood_processing: number;
  carpentry_labour: number;
  panels_cost: number;
  fin_mat: number;
  sand_mat: number;
  sand_lab: number;
  fin_lab: number;
  hardware_cost: number;
  fasteners: number;
  packing: number;
  misc: number;
  overhead: number;
}

const C43: Record<string, ExpectedLines> = {
  "OV-505 B": {
    unit_cost: 725983,
    timber_wood_processing: 300408,
    carpentry_labour: 78040,
    panels_cost: 0,
    fin_mat: 18424,
    sand_mat: 6068,
    sand_lab: 18724,
    fin_lab: 42096,
    hardware_cost: 38000,
    fasteners: 18294,
    packing: 91854,
    misc: 30595,
    overhead: 83480,
  },
  "ID-OV-506": {
    unit_cost: 766148,
    timber_wood_processing: 318992,
    carpentry_labour: 82867,
    panels_cost: 0,
    fin_mat: 24937,
    sand_mat: 8214,
    sand_lab: 25343,
    fin_lab: 56977,
    hardware_cost: 0,
    fasteners: 19425,
    packing: 109006,
    misc: 32288,
    overhead: 88098,
  },
  // First item taken from the 12-item stack test (C4.3) rather than the
  // two-item test. Its inputs come from the old BOM rows 555-570; see
  // fixtures/tb-02.json. It is the only fixture so far with bought-in lines
  // and a fractional box qty.
  "TB-02": {
    unit_cost: 1484874,
    timber_wood_processing: 675464,
    carpentry_labour: 118562,
    panels_cost: 0,
    fin_mat: 11747,
    sand_mat: 3869,
    sand_lab: 11938,
    fin_lab: 26840,
    hardware_cost: 285000,
    fasteners: 27793,
    packing: 90342,
    misc: 62578,
    overhead: 170743,
  },
  // The first fixture with a panel line, so the first to put P1-P4 and the 25%
  // offcut rule against a reference number.
  "AA-04B": {
    unit_cost: 2538936,
    timber_wood_processing: 549133,
    carpentry_labour: 288066,
    panels_cost: 225750,
    fin_mat: 24598,
    sand_mat: 8102,
    sand_lab: 24999,
    fin_lab: 56204,
    hardware_cost: 717200,
    fasteners: 67527,
    packing: 178408,
    misc: 106999,
    overhead: 291948,
  },
};

function expectedDirect(e: ExpectedLines): number {
  return (
    e.timber_wood_processing +
    e.carpentry_labour +
    e.panels_cost +
    e.fin_mat +
    e.sand_mat +
    e.sand_lab +
    e.fin_lab +
    e.hardware_cost +
    e.fasteners +
    e.packing
  );
}

describe("C4.6 stack test — unit cost to the rupiah", () => {
  test("OV-505 B, tier rule 2026-09-30", () => {
    expect(Math.round(cost(OV505B, "2026-09-30").unit_cost)).toBe(725983);
  });

  test("ID-OV-506, tier rule 2026-09-30", () => {
    expect(Math.round(cost(IDOV506, "2026-09-30").unit_cost)).toBe(766148);
  });

  test("OV-505 B, tier rule 2026-09-29", () => {
    expect(Math.round(cost(OV505B, "2026-09-29").unit_cost)).toBe(760154);
  });

  test("ID-OV-506, tier rule 2026-09-29", () => {
    expect(Math.round(cost(IDOV506, "2026-09-29").unit_cost)).toBe(861256);
  });

  test("2026-09-30 is the default", () => {
    expect(costItem(OV505B, rates, norms).unit_cost).toBe(cost(OV505B, "2026-09-30").unit_cost);
  });
});

describe.each([
  ["OV-505 B", OV505B],
  ["ID-OV-506", IDOV506],
  ["TB-02", TB02],
  ["AA-04B", AA04B],
])("C4.3 per-line values — %s (tier rule 2026-09-30)", (name, item) => {
  const r = cost(item, "2026-09-30");
  const e = C43[name]!;

  test.each(Object.keys(e) as Array<keyof ExpectedLines>)("%s", (line) => {
    expect(Math.round(r[line])).toBe(e[line]);
  });

  /**
   * C4.3 prints each line already rounded to the rupiah, so the sum of its ten
   * printed lines can sit up to 5 IDR away from the rounded total (and the two
   * timber columns up to 1 IDR). Compare like with like: the engine's own
   * unrounded sum is exact, and the spec's rounded sum within that slack.
   * TB-02 is where this bites: direct 1,251,553.29 against 1,251,555 printed.
   */
  test("DIRECT COST = the engine's own ten cost lines", () => {
    const own =
      r.timber_wood_processing +
      r.carpentry_labour +
      r.panels_cost +
      r.fin_mat +
      r.sand_mat +
      r.sand_lab +
      r.fin_lab +
      r.hardware_cost +
      r.fasteners +
      r.packing;
    expect(r.direct).toBeCloseTo(own, 6);
  });

  test("DIRECT COST is within rounding of the ten C4.3 lines", () => {
    expect(Math.abs(Math.round(r.direct) - expectedDirect(e))).toBeLessThanOrEqual(5);
  });

  test("TIMBER = wood + processing + carpentry labour", () => {
    expect(r.timber).toBeCloseTo(r.timber_wood_processing + r.carpentry_labour, 6);
    expect(
      Math.abs(Math.round(r.timber) - (e.timber_wood_processing + e.carpentry_labour)),
    ).toBeLessThanOrEqual(1);
  });

  test("UNIT COST = direct + misc + overhead", () => {
    expect(Math.round(r.direct + r.misc + r.overhead)).toBe(e.unit_cost);
  });

  test("every filled line reads OK", () => {
    expect(r.checks).toEqual([]);
    expect(r.ok).toBe(true);
  });
});

describe("C4.6 / C4.4 aggregates", () => {
  test("OV-505 B tiers are all B under the 40 x 40 rule", () => {
    expect(cost(OV505B, "2026-09-30").solid.map((l) => l.auto_tier)).toEqual(["B", "B", "B", "B"]);
  });

  test("OV-505 B: the 1150 mm rail is tier A under the 29 Sep rule", () => {
    expect(cost(OV505B, "2026-09-29").solid.map((l) => l.auto_tier)).toEqual(["B", "A", "B", "B"]);
  });

  test("ID-OV-506: the 1165 mm slat is tier A under the 29 Sep rule", () => {
    expect(cost(IDOV506, "2026-09-29").solid.map((l) => l.auto_tier)).toEqual(["B", "A"]);
  });

  test("solid wood m3", () => {
    expect(cost(OV505B, "2026-09-30").solid_m3).toBeCloseTo(0.0104499, 9);
    expect(cost(IDOV506, "2026-09-30").solid_m3).toBeCloseTo(0.01109636, 9);
  });

  test("finishing m2, one face (C4.4: 0.474 and 0.642)", () => {
    expect(cost(OV505B, "2026-09-30").finishing_m2).toBeCloseTo(0.4743, 6);
    expect(cost(IDOV506, "2026-09-30").finishing_m2).toBeCloseTo(0.64196, 6);
  });

  test("OV-505 B packing: one box 1220 x 620 x 50 + 40 mm per dimension", () => {
    const r = cost(OV505B, "2026-09-30");
    expect(r.cartons).toBe(1);
    expect(r.carton_m2).toBeCloseTo(2.0088, 6);
    expect(r.carton_m3).toBeCloseTo(0.074844, 9);
    expect(r.boxes[0]).toMatchObject({ carton_l: 1260, carton_w: 660, carton_h: 90 });
  });

  test("ID-OV-506 packing: box rows blank, carton from the overall size", () => {
    const r = cost(IDOV506, "2026-09-30");
    expect(r.cartons).toBe(1);
    expect(r.carton_m2).toBeCloseTo(2.170894, 6);
    expect(r.carton_m3).toBeCloseTo(0.178288185, 9);
    expect(r.boxes).toEqual([]);
  });

  test("no panels on either item", () => {
    expect(cost(OV505B, "2026-09-30").panel_sheets).toBe(0);
    expect(cost(IDOV506, "2026-09-30").panel_sheets).toBe(0);
  });

  test("project totals (C4.1)", () => {
    expect(Math.round(cost(OV505B, "2026-09-30").project_total)).toBe(171332078);
    expect(Math.round(cost(IDOV506, "2026-09-30").project_total)).toBe(83510085);
  });

  test("the summary has 18 lines plus the two extra rows", () => {
    const s = cost(OV505B, "2026-09-30").summary;
    expect(s).toHaveLength(20);
    expect(s.slice(0, 18).map((x) => x.row)).toEqual([
      82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
    ]);
    expect(s.map((x) => x.label)).toEqual([
      "Solid wood m3",
      "Panel sheets",
      "Finishing m2 (exposed)",
      "Cartons",
      "Carton m3",
      "TIMBER",
      "FASTENERS",
      "PANELS",
      "FINISHING MATERIALS",
      "SANDING MATERIALS",
      "SANDING LABOUR",
      "FINISHING LABOUR",
      "HARDWARE",
      "PACKING",
      "DIRECT COST",
      "MISC 5%",
      "OVERHEAD",
      "UNIT COST IDR",
      "Carton board m2 (6 sides)",
      "PROJECT QTY x UNIT COST",
    ]);
  });
});

describe("FIN_EXPOSED_ONLY = 0, all faces (C4.4 alternative)", () => {
  const allFaces: Norms = { ...norms, FIN_EXPOSED_ONLY: 0 };

  test("OV-505 B: about 1.708 m2 and 989,239 IDR per unit", () => {
    const r = costItem(OV505B, rates, allFaces, { tierRuleVersion: "2026-09-30" });
    expect(r.finishing_m2).toBeCloseTo(1.708, 3);
    expect(Math.round(r.unit_cost)).toBe(989239);
  });

  test("ID-OV-506: about 1.982 m2 and 1,052,042 IDR per unit", () => {
    const r = costItem(IDOV506, rates, allFaces, { tierRuleVersion: "2026-09-30" });
    expect(r.finishing_m2).toBeCloseTo(1.982, 3);
    expect(Math.round(r.unit_cost)).toBe(1052042);
  });

  test("29 Sep tier rule with all faces (C4.6: 1,023,410 and 1,147,150)", () => {
    expect(
      Math.round(costItem(OV505B, rates, allFaces, { tierRuleVersion: "2026-09-29" }).unit_cost),
    ).toBe(1023410);
    expect(
      Math.round(costItem(IDOV506, rates, allFaces, { tierRuleVersion: "2026-09-29" }).unit_cost),
    ).toBe(1147150);
  });
});

describe("TB-02 — the 12-item stack test (C4.1, C4.3, C4.4)", () => {
  const r = cost(TB02, "2026-09-30");

  test("the turned post is A-CURVED, the base is B", () => {
    expect(r.solid.map((l) => [l.component, l.auto_tier, l.rate_code])).toEqual([
      ["KAYU UNTUK TIANG", "A-CURVED", "TEAK_AC"],
      ["KAYU BASE", "B", "TEAK_B"],
    ]);
  });

  test("solid wood m3 is the old BOM's own 0.015876", () => {
    expect(r.solid_m3).toBeCloseTo(0.015876, 9);
  });

  test("finishing m2, one face (C4.4: 0.302)", () => {
    expect(r.finishing_m2).toBeCloseTo(0.3024, 6);
  });

  test("packing: two units to a carton, so box qty 0.5", () => {
    expect(r.carton_m2).toBeCloseTo(1.6635, 6);
    expect(r.carton_m3).toBeCloseTo(0.20475, 9);
    expect(r.boxes[0]).toMatchObject({ carton_l: 650, carton_w: 750, carton_h: 840 });
  });

  test("bought-in and outside labour total 285,000 (C4.3)", () => {
    expect(Math.round(r.hardware_cost)).toBe(285000);
  });

  test("project total, 118 units (C4.1: 175,215,165)", () => {
    expect(Math.round(r.project_total)).toBe(175215165);
  });
});

describe("AA-04B — the panel path against a reference number (C4.3, C4.5)", () => {
  const r = cost(AA04B, "2026-09-30");

  test("C4.5 #2: the lamp housing and the corner blocks are the curved parts", () => {
    expect(r.solid.map((l) => [l.component, l.auto_tier])).toEqual([
      ["FRAME PANJANG", "A"],
      ["FRAME PENDEK", "B"],
      ["RUMAH LAMPU", "A-CURVED"],
      ["KAYU SUDUT", "A-CURVED"],
    ]);
  });

  /**
   * P1-P4 end to end against a reference figure. 1990 x 750 nests one to a
   * 2440 x 1220 sheet and wastes 49.9% of it, so rule P3 charges 1.05 sheets
   * instead of a whole one: 1.05 x 215,000 = 225,750, the panel figure C4.3
   * prints. PLAN.md records that P3 has no formula in the 29 Sep template;
   * this is the evidence that the 12-item workbook applied it anyway.
   */
  test("the panel nests, the offcut rule bites, and the cost is the reference figure", () => {
    const p = r.panels[0]!;
    expect(p.pieces_per_sheet).toBe(1);
    expect(p.sheets).toBe(1);
    expect(p.waste).toBeGreaterThan(norms.WASTE_REUSE_MIN!);
    expect(p.sheets_charged).toBeCloseTo(1.05, 10);
    expect(p.rate_value).toBe(215000);
    expect(Math.round(p.cost!)).toBe(225750);
    expect(p.check).toBe("OK");
  });

  test("the plywood takes no finish, so finishing is the four solid faces only", () => {
    expect(r.finishing_m2).toBeCloseTo(0.63325, 6);
  });

  test("C4.5 #6: an assembled item takes its carton from the overall size", () => {
    expect(r.boxes).toEqual([]);
    expect(r.cartons).toBe(1);
    expect(r.carton_m2).toBeCloseTo(3.8278, 6);
    expect(r.carton_m3).toBeCloseTo(0.176407, 9);
  });

  test("project total, 91 units (C4.1: 231,043,160)", () => {
    expect(Math.round(r.project_total)).toBe(231043160);
  });
});
