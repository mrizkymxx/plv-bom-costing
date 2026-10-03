import { autoTier, median3, solidRateCode } from "../src/index";
import type { Norms, SolidLine } from "../src/index";
import normsJson from "../fixtures/norms-2026-09-30.json";

const norms = normsJson as unknown as Norms;

/** Exposed, straight teak part of the given size. */
function part(l: number, w: number, t: number, extra: Partial<SolidLine> = {}): SolidLine {
  return { material: "TEAK", l, w, t, qty: 1, exposed: "Y", curved: "N", ...extra };
}

describe("median3", () => {
  test("is the middle value whatever the column order", () => {
    expect(median3(720, 25, 16)).toBe(25);
    expect(median3(16, 720, 25)).toBe(25);
    expect(median3(25, 16, 720)).toBe(25);
    expect(median3(40, 40, 300)).toBe(40);
  });
});

describe("T1 — 30 Sep rule (C1.5, 7 steps)", () => {
  test("OV-505 B slat 720 x 25 x 16 -> B", () => {
    expect(autoTier(part(720, 25, 16), norms, "2026-09-30")).toBe("B");
  });

  test("ID-OV-506 slat 1165 x 22 x 16 -> B (narrow section up to 1500 mm)", () => {
    expect(autoTier(part(1165, 22, 16), norms, "2026-09-30")).toBe("B");
  });

  test("OV-505 B leg 450 x 33 x 33 -> B", () => {
    expect(autoTier(part(450, 33, 33), norms, "2026-09-30")).toBe("B");
  });

  test("OV-505 B rail 1150 x 33 x 33 -> B", () => {
    expect(autoTier(part(1150, 33, 33), norms, "2026-09-30")).toBe("B");
  });

  test("not exposed -> C, even when long", () => {
    expect(autoTier(part(1800, 60, 40, { exposed: "N" }), norms, "2026-09-30")).toBe("C");
  });

  test("curved -> A-CURVED", () => {
    expect(autoTier(part(360, 76, 45, { curved: "Y" }), norms, "2026-09-30")).toBe("A-CURVED");
  });

  test("a curved narrow part is A-CURVED: curved is tested before NARROW", () => {
    expect(autoTier(part(900, 30, 30, { curved: "Y" }), norms, "2026-09-30")).toBe("A-CURVED");
  });

  test("300 x 40 x 40 is NOT D (vol 0.00048 < 0.0005 but max dim 300 is not < 300)", () => {
    expect(autoTier(part(300, 40, 40), norms, "2026-09-30")).not.toBe("D");
    expect(autoTier(part(300, 40, 40), norms, "2026-09-30")).toBe("B");
  });

  test("250 x 40 x 40 -> D (both conditions met)", () => {
    expect(autoTier(part(250, 40, 40), norms, "2026-09-30")).toBe("D");
  });

  test("D beats non-exposed and curved: tested first", () => {
    expect(autoTier(part(250, 40, 40, { exposed: "N" }), norms, "2026-09-30")).toBe("D");
    expect(autoTier(part(250, 40, 40, { curved: "Y" }), norms, "2026-09-30")).toBe("D");
  });

  test("section wider than 40 mm falls through to the length test", () => {
    expect(autoTier(part(1200, 45, 45), norms, "2026-09-30")).toBe("A");
    expect(autoTier(part(900, 45, 45), norms, "2026-09-30")).toBe("B");
  });

  test("narrow but longer than 1500 mm -> A", () => {
    expect(autoTier(part(1600, 30, 30), norms, "2026-09-30")).toBe("A");
  });

  test("section exactly 40 x 40 at exactly 1500 mm is inclusive -> B", () => {
    expect(autoTier(part(1500, 40, 40), norms, "2026-09-30")).toBe("B");
  });

  test("tier override wins", () => {
    expect(autoTier(part(250, 40, 40, { tier_override: "A" }), norms, "2026-09-30")).toBe("A");
  });

  test("an empty line has no tier", () => {
    expect(autoTier({ material: "TEAK" }, norms, "2026-09-30")).toBeNull();
  });
});

describe("T1 — 29 Sep rule (C2.5 column N, no NARROW step)", () => {
  test("ID-OV-506 slat 1165 x 22 x 16 -> A", () => {
    expect(autoTier(part(1165, 22, 16), norms, "2026-09-29")).toBe("A");
  });

  test("OV-505 B rail 1150 x 33 x 33 -> A", () => {
    expect(autoTier(part(1150, 33, 33), norms, "2026-09-29")).toBe("A");
  });

  test("OV-505 B slat 720 x 25 x 16 -> B (under 1000 mm)", () => {
    expect(autoTier(part(720, 25, 16), norms, "2026-09-29")).toBe("B");
  });

  test("250 x 40 x 40 -> D, unchanged", () => {
    expect(autoTier(part(250, 40, 40), norms, "2026-09-29")).toBe("D");
  });
});

describe("rate code lookup (C2.5 column R, CLAUDE.md rule 9)", () => {
  test("A-CURVED collapses to AC", () => {
    expect(solidRateCode("TEAK", "A-CURVED")).toBe("TEAK_AC");
    expect(solidRateCode("MINDI", "A-CURVED")).toBe("MINDI_AC");
  });

  test("ordinary tiers", () => {
    expect(solidRateCode("TEAK", "A")).toBe("TEAK_A");
    expect(solidRateCode("MINDI", "D")).toBe("MINDI_D");
  });

  test("MERANTI ignores the tier", () => {
    expect(solidRateCode("MERANTI", "A")).toBe("MERANTI");
    expect(solidRateCode("MERANTI", "C")).toBe("MERANTI");
  });

  test("OTHER has no rate on the card", () => {
    expect(solidRateCode("OTHER", "B")).toBe("OTHER_B");
  });
});
