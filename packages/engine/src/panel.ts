/**
 * Rules P1-P4 — panel nesting, sheets, waste, sheets charged, cost.
 * Column formulas from C2.6; P3 from the C1.4 rule spec.
 */

import { normOf } from "./lookup";
import type { Norms, PanelLine, PanelLineResult, Rates } from "./types";

/** Thickness encoded in a panel type code, e.g. PLY-18-TDF -> 18. C2.6 column Q. */
export function panelThickness(code: string | undefined): number | null {
  if (!code) return null;
  // Sheet: VALUE(MID(B,5,FIND("-",B,5)-5))
  const sep = code.indexOf("-", 4);
  if (sep < 0) return null;
  const n = Number(code.slice(4, sep));
  return Number.isFinite(n) ? n : null;
}

/** P1 — pieces per sheet, both orientations, kerf added to each panel dimension. */
export function piecesPerSheet(l: number, w: number, norms: Norms): number {
  const kerf = normOf(norms, "SHEET_KERF");
  const sheetL = normOf(norms, "SHEET_L");
  const sheetW = normOf(norms, "SHEET_W");
  const lp = l + kerf;
  const wp = w + kerf;
  return Math.max(
    Math.trunc(sheetL / lp) * Math.trunc(sheetW / wp),
    Math.trunc(sheetL / wp) * Math.trunc(sheetW / lp),
  );
}

/** P3 — sheets charged. Fractional sheets x (1 + handling) when the offcut is reusable. */
export function sheetsCharged(
  sheets: number,
  whole: number,
  waste: number,
  norms: Norms,
): number {
  return waste > normOf(norms, "WASTE_REUSE_MIN")
    ? sheets * (1 + normOf(norms, "OFFCUT_HANDLING"))
    : whole;
}

/**
 * Q-11 (decided 2026-10-02): a panel too big for one sheet in either
 * orientation gets joined from several sheets instead of being blocked.
 * Picks whichever of the two axis-assignments needs fewer sheets, the same
 * "try both orientations" idea as `piecesPerSheet`. Joints = sheets - 1,
 * the minimum seams to join that many sheets into one panel.
 */
export function sheetsForOversizePanel(l: number, w: number, norms: Norms): { sheets: number; joints: number } {
  const sheetL = normOf(norms, "SHEET_L");
  const sheetW = normOf(norms, "SHEET_W");
  const optionA = Math.ceil(l / sheetL) * Math.ceil(w / sheetW);
  const optionB = Math.ceil(l / sheetW) * Math.ceil(w / sheetL);
  const sheets = Math.min(optionA, optionB);
  return { sheets, joints: sheets - 1 };
}

export function computePanel(
  line: PanelLine,
  rates: Rates,
  norms: Norms,
  lineNo: number,
): PanelLineResult {
  const qty = line.qty ?? 1;
  const hasSize = line.l !== undefined && line.l !== null && line.w !== undefined && line.w !== null;
  const manual = line.sheets_manual;

  const result: PanelLineResult = {
    line_no: lineNo,
    panel_type: line.panel_type ?? null,
    component: line.component ?? null,
    vol_m3: null,
    face_m2: null,
    pieces_per_sheet: null,
    sheets: null,
    sheets_whole: null,
    waste: null,
    sheets_charged: null,
    rate_code: line.panel_type ?? null,
    rate_value: null,
    joints: null,
    joint_cost: null,
    cost: null,
    check: "",
  };

  if (hasSize) {
    const l = line.l as number;
    const w = line.w as number;
    result.face_m2 = (l * w) / 1e6 * qty;
    if (line.t !== undefined && line.t !== null) {
      result.vol_m3 = (l * w * line.t) / 1e9 * qty;
    }

    const n = piecesPerSheet(l, w, norms);
    result.pieces_per_sheet = n;

    if (n > 0) {
      const sheets = qty / n;
      const whole = Math.ceil(sheets);
      const waste =
        1 - (qty * l * w) / (whole * normOf(norms, "SHEET_L") * normOf(norms, "SHEET_W"));
      result.sheets = sheets;
      result.sheets_whole = whole;
      result.waste = waste;
      result.sheets_charged = sheetsCharged(sheets, whole, waste, norms);
    } else {
      // Q-11: joined from several sheets instead of blocked.
      const { sheets, joints } = sheetsForOversizePanel(l, w, norms);
      result.sheets = sheets * qty;
      result.sheets_whole = sheets * qty;
      result.waste = 0;
      result.sheets_charged = sheets * qty;
      result.joints = joints * qty;
    }

    // CHECK, C2.6 column Q.
    if (!line.panel_type) {
      result.check = "panel type?";
    } else if (panelThickness(line.panel_type) !== (line.t ?? null)) {
      result.check = "T must match panel type";
    } else if (line.exposed_faces === undefined || line.exposed_faces === null) {
      result.check = "exposed faces?";
    } else {
      result.check = "OK";
    }
  }

  // SHEETS (manual), 30 Sep addition: a sheet count with no size overrides the nesting.
  if (manual !== undefined && manual !== null) {
    result.sheets = manual;
    result.sheets_whole = Math.ceil(manual);
    result.sheets_charged = manual;
    if (!hasSize) {
      result.check = line.panel_type ? "OK" : "panel type?";
    }
  }

  if (line.panel_type) {
    const rate = rates[line.panel_type];
    if (rate === undefined) {
      result.rate_value = null;
      if (result.check === "OK") result.check = "rate?";
    } else {
      result.rate_value = rate;
      // P4 — sheets charged x sheet rate. No labour line.
      if (result.sheets_charged !== null) result.cost = result.sheets_charged * rate;
    }
  }

  // Q-11: the joint labour on top of the sheet cost above — needs its own
  // rate (none published yet), so this flags rather than silently costing 0.
  if (result.joints !== null && result.joints > 0) {
    const jointRate = rates.PANEL_JOINT;
    if (jointRate === undefined) {
      if (result.check === "OK") result.check = "joint rate?";
    } else {
      result.joint_cost = result.joints * jointRate;
      result.cost = (result.cost ?? 0) + result.joint_cost;
    }
  }

  return result;
}
