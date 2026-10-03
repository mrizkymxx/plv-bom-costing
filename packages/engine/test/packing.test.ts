import { computePacking, costItem, deriveRates, packingCost } from "../src/index";
import type { BomInput, Header, Norms, RateInputs } from "../src/index";
import normsJson from "../fixtures/norms-2026-09-30.json";
import rateInputs from "../fixtures/rate-inputs-2026-09-29.json";

const norms = normsJson as unknown as Norms;
const rates = deriveRates(rateInputs as unknown as RateInputs, norms);

const header: Header = { item_code: "X", overall_l: 1200, overall_w: 550, overall_h: 438 };

describe("K1 — carton sizes (C2.4)", () => {
  test("blank box rows fall back to the overall size + CARTON_ADD", () => {
    const agg = computePacking(header, [], norms);
    expect(agg.from_overall).toBe(true);
    expect(agg.cartons).toBe(1);
    // 1240 x 590 x 478
    expect(agg.m2).toBeCloseTo((2 * (1240 * 590 + 1240 * 478 + 590 * 478)) / 1e6, 10);
    expect(agg.m3).toBeCloseTo((1240 * 590 * 478) / 1e9, 12);
  });

  test("CARTON_ADD is added once per dimension, not per side", () => {
    const agg = computePacking(header, [{ l: 1600, w: 900, h: 60, qty: 1 }], norms);
    expect(agg.rows[0]).toMatchObject({ carton_l: 1640, carton_w: 940, carton_h: 100 });
  });

  test("two box rows: the flatpack example of C2.9 (2 cartons, 6.13 m2, 0.39 m3)", () => {
    const agg = computePacking({ item_code: "PL 0XX", overall_l: 1600, overall_w: 900, overall_h: 760 }, [
      { box_no: 1, contents: "Table top", l: 1600, w: 900, h: 60, qty: 1 },
      { box_no: 2, contents: "Base / legs", l: 900, w: 700, h: 300, qty: 1 },
    ], norms);
    expect(agg.cartons).toBe(2);
    expect(agg.m2).toBeCloseTo(6.13, 2);
    expect(agg.m3).toBeCloseTo(0.39, 2);
  });

  test("blank box qty counts as 1", () => {
    const agg = computePacking(header, [{ l: 1000, w: 500, h: 100 }], norms);
    expect(agg.cartons).toBe(1);
    expect(agg.rows[0]!.qty).toBe(1);
  });

  test("box qty may be fractional (TB-02 is 2 tables per carton, entered as 0.5)", () => {
    const agg = computePacking(header, [{ l: 1000, w: 500, h: 100, qty: 0.5 }], norms);
    expect(agg.cartons).toBe(0.5);
    expect(agg.m3).toBeCloseTo(((1040 * 540 * 140) / 1e9) * 0.5, 12);
  });
});

describe("K2 — packing cost (C2.8 row 92)", () => {
  test("flat m2 rate plus labour per m3", () => {
    const agg = computePacking(header, [{ l: 1220, w: 620, h: 50, qty: 1 }], norms);
    expect(packingCost(agg, rates, norms)).toBeCloseTo(2.0088 * 42000 + 0.074844 * 100000, 6);
  });

  test("below CARTON_MIN_M2 the group A price is used per carton", () => {
    // 100 x 100 x 10 -> carton 140 x 140 x 50 -> 0.0672 m2, under 0.15
    const agg = computePacking(header, [{ l: 100, w: 100, h: 10, qty: 2 }], norms);
    expect(agg.m2).toBeLessThan(norms.CARTON_MIN_M2!);
    expect(packingCost(agg, rates, norms)).toBeCloseTo(24000 * 2 + agg.m3 * 100000, 6);
  });

  test("KD_PACK_FACTOR applies only above one carton, and is 0 by default", () => {
    const twoBoxes = computePacking(header, [
      { l: 1000, w: 500, h: 100, qty: 1 },
      { l: 800, w: 400, h: 100, qty: 1 },
    ], norms);
    expect(twoBoxes.cartons).toBe(2);
    expect(packingCost(twoBoxes, rates, norms)).toBeCloseTo(
      twoBoxes.m2 * 42000 + twoBoxes.m3 * 100000,
      6,
    );

    const withKd: Norms = { ...norms, KD_PACK_FACTOR: 0.15 };
    expect(packingCost(twoBoxes, rates, withKd)).toBeCloseTo(
      twoBoxes.m2 * 42000 * 1.15 + twoBoxes.m3 * 100000,
      6,
    );
    // one carton: the factor is not applied
    const oneBox = computePacking(header, [{ l: 1000, w: 500, h: 100, qty: 1 }], norms);
    expect(packingCost(oneBox, rates, withKd)).toBeCloseTo(
      oneBox.m2 * 42000 + oneBox.m3 * 100000,
      6,
    );
  });
});

describe("check messages on the solid block (C2.5, verbatim)", () => {
  const line = { material: "TEAK", l: 450, w: 33, t: 33, qty: 1, exposed: "Y" as const };
  const run = (overrides: Record<string, unknown>) => {
    const input: BomInput = { header, solid: [{ ...line, ...overrides }] };
    return costItem(input, rates, norms).solid[0]!.check;
  };

  test("empty line has no message", () => {
    expect(costItem({ header, solid: [{}] }, rates, norms).solid[0]!.check).toBe("");
  });

  test("material?", () => {
    expect(run({ material: undefined })).toBe("material?");
  });

  test("exposed Y/N?", () => {
    expect(run({ exposed: undefined })).toBe("exposed Y/N?");
  });

  test("qty?", () => {
    expect(run({ qty: undefined })).toBe("qty?");
  });

  test("rate? for species OTHER", () => {
    expect(run({ material: "OTHER" })).toBe("rate?");
  });

  test("OK", () => {
    expect(run({})).toBe("OK");
  });

  test("a non-OK check clears the ok flag", () => {
    const r = costItem({ header, solid: [{ ...line, material: "OTHER" }] }, rates, norms);
    expect(r.ok).toBe(false);
    expect(r.checks).toEqual(["rate?"]);
  });
});

describe("T2 / T3 — MERANTI and mixed species", () => {
  test("MERANTI uses the MERANTI rate whatever the tier, and still carries fasteners", () => {
    const input: BomInput = {
      header,
      solid: [
        { material: "MERANTI", l: 1200, w: 100, t: 50, qty: 1, exposed: "Y", curved: "N" },
        { material: "MINDI", l: 400, w: 100, t: 50, qty: 1, exposed: "N", curved: "N" },
      ],
    };
    const r = costItem(input, rates, norms);
    expect(r.solid[0]!.auto_tier).toBe("A");
    expect(r.solid[0]!.rate_code).toBe("MERANTI");
    expect(r.solid[1]!.rate_code).toBe("MINDI_C");
    const m3 = 0.006 + 0.002;
    expect(r.solid_m3).toBeCloseTo(m3, 12);
    expect(r.fasteners).toBeCloseTo(m3 * rates.FASTENERS!, 6);
  });
});
