import { computePanel, derivePanelRates, panelThickness, piecesPerSheet, sheetsCharged } from "../src/index";
import type { Norms, PanelLine, Rates } from "../src/index";
import normsJson from "../fixtures/norms-2026-09-30.json";

const norms = normsJson as unknown as Norms;

const rates: Rates = derivePanelRates({
  sheet_L: 2.44,
  sheet_W: 1.22,
  glue_tape: 10424,
  ven_teak: 110000,
  ven_mindi: 20000,
  ven_len: 2.5,
  ven_labour: 57142.86,
  ply: { 3: 77500, 6: 115000, 9: 172500, 12: 215000, 15: 260000, 18: 295000, 24: 375000 },
});

describe("P1 — pieces per sheet (C2.6 column N)", () => {
  test("kerf is added to each panel dimension before nesting", () => {
    // 2440/(486+5) = 4 ; 1220/(480+5) = 2 -> 8. Rotated: 2440/485 = 5 ; 1220/491 = 2 -> 10.
    expect(piecesPerSheet(486, 480, norms)).toBe(10);
  });

  test("the better of the two orientations wins", () => {
    // 486 x 480: along the sheet 4 x 2 = 8; rotated 5 x 2 = 10.
    expect(piecesPerSheet(486, 480, norms)).toBe(10);
    // 1200 x 600: 2 x 2 = 4 either way.
    expect(piecesPerSheet(1200, 600, norms)).toBe(4);
  });

  test("L and W are interchangeable", () => {
    expect(piecesPerSheet(486, 480, norms)).toBe(piecesPerSheet(480, 486, norms));
    expect(piecesPerSheet(800, 400, norms)).toBe(piecesPerSheet(400, 800, norms));
  });

  test("a panel bigger than the sheet gives 0", () => {
    expect(piecesPerSheet(2500, 1300, norms)).toBe(0);
  });

  test("a panel that fits only when rotated", () => {
    expect(piecesPerSheet(1210, 2430, norms)).toBe(1);
  });
});

describe("panelThickness (C2.6 column Q)", () => {
  test.each([
    ["PLY-18-TDF", 18],
    ["PLY-3-RAW", 3],
    ["PLY-24-MSF", 24],
  ])("%s -> %i", (code, t) => {
    expect(panelThickness(code)).toBe(t);
  });

  test("unparseable codes give null", () => {
    expect(panelThickness("PLY18TDF")).toBeNull();
    expect(panelThickness(undefined)).toBeNull();
  });
});

describe("P3 — sheets charged", () => {
  test("waste above WASTE_REUSE_MIN charges fractional sheets x (1 + OFFCUT_HANDLING)", () => {
    expect(sheetsCharged(1.5, 2, 0.4, norms)).toBeCloseTo(1.575, 10);
  });

  test("waste at or below WASTE_REUSE_MIN charges whole sheets", () => {
    expect(sheetsCharged(1.5, 2, 0.25, norms)).toBe(2);
    expect(sheetsCharged(1.5, 2, 0.1, norms)).toBe(2);
  });
});

describe("P1-P4 end to end", () => {
  test("PLY-18-TDF 486 x 480 x 18, qty 1", () => {
    const r = computePanel(
      { panel_type: "PLY-18-TDF", component: "DUDUKAN", l: 486, w: 480, t: 18, qty: 1, exposed_faces: 2 },
      rates,
      norms,
      1,
    );
    expect(r.check).toBe("OK");
    expect(r.pieces_per_sheet).toBe(10);
    expect(r.sheets).toBeCloseTo(0.1, 10);
    expect(r.sheets_whole).toBe(1);
    // waste = 1 - (1 x 486 x 480) / (1 x 2440 x 1220) -> far above 25%, so fractional + 5%
    expect(r.waste).toBeCloseTo(1 - (486 * 480) / (2440 * 1220), 10);
    expect(r.sheets_charged).toBeCloseTo(0.105, 10);
    expect(r.cost).toBeCloseTo(0.105 * rates["PLY-18-TDF"]!, 6);
    expect(r.face_m2).toBeCloseTo(0.23328, 10);
    expect(r.vol_m3).toBeCloseTo(0.00419904, 12);
  });

  test("low waste charges whole sheets", () => {
    // 1210 x 2430 nests 1 per sheet; qty 2 -> 2 sheets, waste under 25%.
    const r = computePanel(
      { panel_type: "PLY-12-RAW", l: 1210, w: 2430, t: 12, qty: 2, exposed_faces: 0 },
      rates,
      norms,
      1,
    );
    expect(r.pieces_per_sheet).toBe(1);
    expect(r.sheets).toBe(2);
    expect(r.waste!).toBeLessThan(norms.WASTE_REUSE_MIN!);
    expect(r.sheets_charged).toBe(2);
    expect(r.cost).toBe(2 * rates["PLY-12-RAW"]!);
  });

  test("SHEETS (manual) overrides the nesting for a panel with no size", () => {
    const r = computePanel({ panel_type: "PLY-9-RAW", sheets_manual: 0.75 }, rates, norms, 1);
    expect(r.check).toBe("OK");
    expect(r.pieces_per_sheet).toBeNull();
    expect(r.sheets).toBe(0.75);
    expect(r.sheets_charged).toBe(0.75);
    expect(r.cost).toBe(0.75 * rates["PLY-9-RAW"]!);
  });
});

describe("Q-11 — a panel bigger than one sheet joins instead of blocking (2026-10-02)", () => {
  // 2500 x 1300: along-sheet needs ceil(2500/2440) x ceil(1300/1220) = 2x2 = 4;
  // rotated needs ceil(2500/1220) x ceil(1300/2440) = 3x1 = 3. The rotated
  // orientation wins (fewer sheets), joints = sheets - 1.
  test("without a joint rate: sheet cost still computes, check flags the missing rate", () => {
    const r = computePanel(
      { panel_type: "PLY-18-TDF", l: 2500, w: 1300, t: 18, qty: 1, exposed_faces: 2 },
      rates,
      norms,
      1,
    );
    expect(r.pieces_per_sheet).toBe(0);
    expect(r.sheets).toBe(3);
    expect(r.sheets_whole).toBe(3);
    expect(r.sheets_charged).toBe(3);
    expect(r.joints).toBe(2);
    expect(r.joint_cost).toBeNull();
    expect(r.cost).toBeCloseTo(3 * rates["PLY-18-TDF"]!, 6);
    expect(r.check).toBe("joint rate?");
  });

  test("with a joint rate: cost includes sheets x panel rate + joints x PANEL_JOINT", () => {
    const withJoint: Rates = { ...rates, PANEL_JOINT: 150000 };
    const r = computePanel(
      { panel_type: "PLY-18-TDF", l: 2500, w: 1300, t: 18, qty: 2, exposed_faces: 2 },
      withJoint,
      norms,
      1,
    );
    // qty 2 doubles both the sheets and the joints.
    expect(r.sheets_charged).toBe(6);
    expect(r.joints).toBe(4);
    expect(r.joint_cost).toBe(4 * 150000);
    expect(r.cost).toBeCloseTo(6 * withJoint["PLY-18-TDF"]! + 4 * 150000, 6);
    expect(r.check).toBe("OK");
  });

  test("a panel that fits one sheet is unaffected (joints stay null)", () => {
    const r = computePanel(
      { panel_type: "PLY-18-TDF", l: 486, w: 480, t: 18, qty: 1, exposed_faces: 2 },
      rates,
      norms,
      1,
    );
    expect(r.joints).toBeNull();
    expect(r.joint_cost).toBeNull();
  });
});

describe("panel check messages (C2.6, verbatim)", () => {
  const base: PanelLine = { panel_type: "PLY-18-TDF", l: 486, w: 480, t: 18, qty: 1, exposed_faces: 2 };
  const check = (p: Partial<PanelLine>) => computePanel({ ...base, ...p }, rates, norms, 1).check;

  test("empty line has no message", () => {
    expect(computePanel({}, rates, norms, 1).check).toBe("");
  });

  test("panel type?", () => {
    expect(check({ panel_type: undefined })).toBe("panel type?");
  });

  test("panel bigger than sheet joins instead of blocking, and flags the missing joint rate (Q-11, 2026-10-02)", () => {
    expect(check({ l: 2500, w: 1300 })).toBe("joint rate?");
  });

  test("T must match panel type", () => {
    expect(check({ t: 12 })).toBe("T must match panel type");
  });

  test("exposed faces?", () => {
    expect(check({ exposed_faces: undefined })).toBe("exposed faces?");
  });

  test("0 exposed faces is a valid entry (raw backing boards)", () => {
    expect(check({ panel_type: "PLY-18-RAW", exposed_faces: 0 })).toBe("OK");
  });

  test("rate? when the panel type is not on the rate card", () => {
    expect(check({ panel_type: "PLY-21-TDF", t: 21 })).toBe("rate?");
  });
});
