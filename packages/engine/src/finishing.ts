/**
 * Rules F1 and F2 — finishing area and the four finishing cost lines.
 *
 * F1 has two modes, selected by the norm FIN_EXPOSED_ONLY:
 *   1 = as implemented in the template and the stack test (C1.5 "F1 as implemented"):
 *       one face per exposed solid component, exposed faces for panels.
 *   0 = all faces of exposed components: 2(LW + LT + WT) x qty.
 */

import { normOf, rateOf } from "./lookup";
import type { Norms, PanelLine, Rates, SolidLine } from "./types";

function allFacesM2(l: number, w: number, t: number, qty: number): number {
  return (2 * (l * w + l * t + w * t)) / 1e6 * qty;
}

/** F1 — finishing m2 for the item. */
export function finishingM2(
  solid: SolidLine[],
  panels: PanelLine[],
  norms: Norms,
): number {
  const exposedOnly = normOf(norms, "FIN_EXPOSED_ONLY") === 1;
  let m2 = 0;

  for (const line of solid) {
    if (line.exposed !== "Y") continue;
    const { l, w, t } = line;
    if (l === undefined || l === null || w === undefined || w === null) continue;
    const qty = line.qty ?? 1;
    if (exposedOnly) {
      // Sheet: SUMIF(H18:H42,"Y",M18:M42) where M = L x W / 1e6 x qty
      m2 += (l * w) / 1e6 * qty;
    } else {
      if (t === undefined || t === null) continue;
      m2 += allFacesM2(l, w, t, qty);
    }
  }

  for (const line of panels) {
    const { l, w, t } = line;
    if (l === undefined || l === null || w === undefined || w === null) continue;
    const qty = line.qty ?? 1;
    const faces = line.exposed_faces ?? 0;
    if (exposedOnly) {
      // Sheet: SUMPRODUCT(M46:M60, H46:H60) — face m2 x exposed faces
      m2 += (l * w) / 1e6 * qty * faces;
    } else {
      if (faces <= 0) continue;
      if (t === undefined || t === null) continue;
      m2 += allFacesM2(l, w, t, qty);
    }
  }

  return m2;
}

export interface FinishingCost {
  fin_mat: number;
  sand_mat: number;
  sand_lab: number;
  fin_lab: number;
  total: number;
}

/** F2 revised (30 Sep) — four separate lines, each = finishing m2 x its rate. */
export function finishingCost(m2: number, rates: Rates): FinishingCost {
  const fin_mat = m2 * rateOf(rates, "FIN_MAT");
  const sand_mat = m2 * rateOf(rates, "SAND_MAT");
  const sand_lab = m2 * rateOf(rates, "SAND_LAB");
  const fin_lab = m2 * rateOf(rates, "FIN_LAB");
  return { fin_mat, sand_mat, sand_lab, fin_lab, total: fin_mat + sand_mat + sand_lab + fin_lab };
}
