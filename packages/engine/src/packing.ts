/**
 * Rules K1 and K2 — carton sizes and packing cost.
 *
 * K1 is the C2.4 box block (rows 11-14) plus its TOTAL row 15.
 * K2 is summary row 92 of C2.8.
 */

import { normOf, rateOf } from "./lookup";
import type { Box, Header, Norms, PackingAggregate, Rates } from "./types";

function filled(v: number | undefined | null): v is number {
  return v !== undefined && v !== null;
}

/** K1 — carton dimensions, m2 and m3 per box row, then the TOTAL row. */
export function computePacking(
  header: Header,
  boxes: Box[],
  norms: Norms,
): PackingAggregate {
  const add = normOf(norms, "CARTON_ADD");
  const rows: PackingAggregate["rows"] = [];

  boxes.forEach((box, idx) => {
    if (!filled(box.l)) return;
    const qty = filled(box.qty) ? box.qty : 1; // blank counts as 1; may be fractional
    const cl = box.l + add;
    const cw = (box.w ?? 0) + add;
    const ch = (box.h ?? 0) + add;
    rows.push({
      box_no: box.box_no ?? idx + 1,
      contents: box.contents ?? null,
      qty,
      carton_l: cl,
      carton_w: cw,
      carton_h: ch,
      m2: (2 * (cl * cw + cl * ch + cw * ch)) / 1e6 * qty,
      m3: (cl * cw * ch) / 1e9 * qty,
    });
  });

  // TOTAL row 15: the sheet tests D11 — the first box row. Blank -> one carton
  // built from the overall size + CARTON_ADD on each dimension.
  const firstRowFilled = boxes.length > 0 && boxes.some((b) => filled(b.l));

  if (!firstRowFilled) {
    const hasOverall =
      filled(header.overall_l) &&
      filled(header.overall_w) &&
      filled(header.overall_h) &&
      header.overall_l > 0 &&
      header.overall_w > 0 &&
      header.overall_h > 0;

    if (!hasOverall || header.overall_l === undefined || header.overall_w === undefined || header.overall_h === undefined) {
      return {
        rows: [],
        cartons: 0,
        m2: 0,
        m3: 0,
        from_overall: true,
      };
    }

    const l = header.overall_l + add;
    const w = header.overall_w + add;
    const h = header.overall_h + add;
    return {
      rows: [],
      cartons: 1,
      m2: (2 * (l * w + l * h + w * h)) / 1e6,
      m3: (l * w * h) / 1e9,
      from_overall: true,
    };
  }

  return {
    rows,
    cartons: rows.reduce((s, r) => s + r.qty, 0),
    m2: rows.reduce((s, r) => s + r.m2, 0),
    m3: rows.reduce((s, r) => s + r.m3, 0),
    from_overall: false,
  };
}

/**
 * K2 — packing cost, summary row 92:
 *   IF(m2 < CARTON_MIN_M2, GRP_A x cartons, m2 x CARTON_M2 x (1 + IF(cartons > 1, KD_PACK_FACTOR, 0)))
 *   + m3 x PACK_LAB
 */
export function packingCost(agg: PackingAggregate, rates: Rates, norms: Norms): number {
  if (agg.cartons === 0) return 0;
  const board =
    agg.m2 < normOf(norms, "CARTON_MIN_M2")
      ? rateOf(rates, "GRP_A") * agg.cartons
      : agg.m2 *
        rateOf(rates, "CARTON_M2") *
        (1 + (agg.cartons > 1 ? normOf(norms, "KD_PACK_FACTOR") : 0));
  return board + agg.m3 * rateOf(rates, "PACK_LAB");
}
