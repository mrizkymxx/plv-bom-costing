import { deriveRates, derivePanelRates } from "../src/index";
import type { RateInputs, Norms } from "../src/index";
import rateInputs from "../fixtures/rate-inputs-2026-09-29.json";
import normsJson from "../fixtures/norms-2026-09-30.json";

const inputs = rateInputs as unknown as RateInputs;
const norms = normsJson as unknown as Norms;

const rates = deriveRates(inputs, norms);

/** C1.5 RATES tab, "Value (calculated, not rounded)" column, to 4 decimals. */
const EXPECTED: Record<string, number> = {
  LAB_CARP: 7467982.6566,
  TEAK_A: 47714405.6566,
  TEAK_AC: 60363281.4566,
  TEAK_B: 36215427.6566,
  TEAK_C: 30465938.6566,
  TEAK_D: 24716449.6566,
  MINDI_A: 20414405.6566,
  MINDI_AC: 24483281.4566,
  MINDI_B: 16715427.6566,
  MINDI_C: 14865938.6566,
  MINDI_D: 13016449.6566,
  MERANTI: 20217982.6566,
  FASTENERS: 1750614.2506,
  FIN_MAT: 38844.5642,
  SAND_MAT: 12794.5522,
  SAND_LAB: 39477.2041,
  FIN_LAB: 88754.9728,
  FIN_ALL: 179871.2932,
};

describe("deriveRates — C1.5 RATES tab", () => {
  for (const [code, value] of Object.entries(EXPECTED)) {
    test(`${code} = ${value}`, () => {
      expect(rates[code]).toBeCloseTo(value, 4);
    });
  }

  test("OH_PCT is the exact ratio quoted in C1.5", () => {
    expect(rates.OH_PCT).toBe(0.1299286984895744);
  });

  test("MISC_PCT, CARTON_M2, PACK_LAB, GRP_A, USD_IDR pass through", () => {
    expect(rates.MISC_PCT).toBe(0.05);
    expect(rates.CARTON_M2).toBe(42000);
    expect(rates.PACK_LAB).toBe(100000);
    expect(rates.GRP_A).toBe(24000);
    expect(rates.USD_IDR).toBe(16000);
  });

  test("FIN_ALL equals the 29 Sep two-rate card (51,639 material + 128,232 labour)", () => {
    expect(rates.FIN_MAT! + rates.SAND_MAT!).toBeCloseTo(51639.1163, 4);
    expect(rates.SAND_LAB! + rates.FIN_LAB!).toBeCloseTo(128232.1769, 4);
  });

  // C1.2 prose quotes teak A as 40,248,423, which is a typo in the spec: the
  // authoritative TIER_CALC row 12 gives wood 38,150,000 + processing 2,096,423
  // = 40,246,423, and RATES TEAK_A 47,714,405.6566 - LAB_CARP 7,467,982.6566
  // = 40,246,423. (The same C1.2 table also misprints TEAK_A as 47,716,405.6566.)
  // Formula left as specified; the expectation follows TIER_CALC / RATES.
  test("wood + processing only, as quoted in C1.2", () => {
    const lab = rates.LAB_CARP!;
    expect(rates.TEAK_A! - lab).toBeCloseTo(40246423, 4);
    expect(rates.TEAK_AC! - lab).toBeCloseTo(52895298.8, 4);
    expect(rates.TEAK_B! - lab).toBeCloseTo(28747445, 4);
    expect(rates.TEAK_C! - lab).toBeCloseTo(22997956, 4);
    expect(rates.TEAK_D! - lab).toBeCloseTo(17248467, 4);
    expect(rates.MINDI_A! - lab).toBeCloseTo(12946423, 4);
    expect(rates.MINDI_AC! - lab).toBeCloseTo(17015298.8, 4);
    expect(rates.MINDI_B! - lab).toBeCloseTo(9247445, 4);
    expect(rates.MINDI_C! - lab).toBeCloseTo(7397956, 4);
    expect(rates.MINDI_D! - lab).toBeCloseTo(5548467, 4);
  });

  test("the RATES tab mirrors CARTON_MIN_M2 and KD_PACK_FACTOR from NORMS", () => {
    expect(rates.CARTON_MIN_M2).toBe(0.15);
    expect(rates.KD_PACK_FACTOR).toBe(0);
  });
});

describe("derivePanelRates — C1.1 PANEL_SHEETS tab", () => {
  const panelRates = derivePanelRates({
    sheet_L: 2.44,
    sheet_W: 1.22,
    glue_tape: 10424,
    ven_teak: 110000,
    ven_mindi: 20000,
    ven_len: 2.5,
    ven_labour: 57142.86,
    ply: { 3: 77500, 6: 115000, 9: 172500, 12: 215000, 15: 260000, 18: 295000, 24: 375000 },
  });

  test("35 sheet codes", () => {
    const codes = Object.keys(panelRates).filter((k) => k.startsWith("PLY-"));
    expect(codes).toHaveLength(35);
  });

  // PANEL_SHEETS rows 14-20, columns B-F.
  const table: Array<[number, number, number, number, number, number]> = [
    [3, 77500, 215673.02, 353846.05, 440673.02, 803846.05],
    [6, 115000, 253173.02, 391346.05, 478173.02, 841346.05],
    [9, 172500, 310673.02, 448846.05, 535673.02, 898846.05],
    [12, 215000, 353173.02, 491346.05, 578173.02, 941346.05],
    [15, 260000, 398173.02, 536346.05, 623173.02, 986346.05],
    [18, 295000, 433173.02, 571346.05, 658173.02, 1021346.05],
    [24, 375000, 513173.02, 651346.05, 738173.02, 1101346.05],
  ];

  for (const [t, raw, msf, mdf, tsf, tdf] of table) {
    test(`PLY-${t}-* sheet prices`, () => {
      expect(panelRates[`PLY-${t}-RAW`]).toBe(raw);
      expect(panelRates[`PLY-${t}-MSF`]).toBeCloseTo(msf, 2);
      expect(panelRates[`PLY-${t}-MDF`]).toBeCloseTo(mdf, 2);
      expect(panelRates[`PLY-${t}-TSF`]).toBeCloseTo(tsf, 2);
      expect(panelRates[`PLY-${t}-TDF`]).toBeCloseTo(tdf, 2);
    });
  }

  test("the two example codes on the 29 Sep RATES tab", () => {
    expect(panelRates["PLY-18-TDF"]).toBeCloseTo(1021346.0464, 4);
    expect(panelRates["PLY-18-MSF"]).toBeCloseTo(433173.0232, 4);
  });
});
