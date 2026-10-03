/**
 * Derived rates — C1.5 "RATES tab of the stack-test workbooks"
 * (rates_version 2026-09-29, finishing split into four rates 30 Sep).
 *
 * Every rate below is the formula given in that table, applied to the 27 base
 * inputs. Nothing is rounded (CLAUDE.md rule 2); the C1.5 "value" column is the
 * same arithmetic shown to 4 decimals.
 */

import type { Norms, Rates } from "./types";

/** The 27 blue base figures of the RATES tab (C1.5 cells C6-C27, C47-C50, C55). */
export interface RateInputs {
  /** C6  Teak log price, implied, IDR/m3 */
  log_teak: number;
  /** C7  Mindi log price, implied, IDR/m3 */
  log_mindi: number;
  /** C8  Meranti dry sawn timber, IDR/m3 */
  meranti_sawn: number;
  /** C9  Wood processing per m3 of log, IDR/m3 */
  processing: number;
  /** C10 Carpentry payroll pool Mar-Sep 2026, IDR */
  carp_pool: number;
  /** C11 Less panel cutting / pressing, fraction */
  carp_deduct: number;
  /** C12 STMV solid wood in components, m3 */
  comp_m3: number;
  /** C13 Yield factor tier A */
  yield_A: number;
  /** C14 Yield factor tier A-CURVED */
  yield_AC: number;
  /** C15 Yield factor tier B */
  yield_B: number;
  /** C16 Yield factor tier C */
  yield_C: number;
  /** C17 Yield factor tier D */
  yield_D: number;
  /** C18 Meranti sawn-to-component yield */
  yield_MER: number;
  /** C19 Screws, nails, dowels, wood glue, IDR */
  fast_total: number;
  /** C20 Zhanchen + thinner, IDR */
  paint_total: number;
  /** C21 Abrasives / sandpaper, IDR */
  abrasive_total: number;
  /** C22 Finishing payroll pool excl. sanding, IDR */
  fin_pool: number;
  /** C23 Sanding payroll pool as paid, IDR */
  sand_pool: number;
  /** C24 Sanding share kept, fraction */
  sand_keep: number;
  /** C25 STMV finishing surface, m2 */
  fin_m2: number;
  /** C26 Overhead payroll + utilities - PLN upgrade, IDR */
  oh_pool: number;
  /** C27 STMV direct cost, IDR */
  stmv_direct: number;
  /** C47 Carton + consumables per m2 of carton board, IDR/m2 */
  carton_m2: number;
  /** C48 Packing labour per m3 of carton, IDR/m3 */
  pack_lab: number;
  /** C49 Carton group A price, IDR */
  grp_a: number;
  /** C50 Miscellaneous, fraction of direct cost */
  misc_pct: number;
  /** C55 Exchange rate implied by the old BOM, IDR/USD */
  usd_idr: number;
}

/**
 * Builds the RATES tab from the base inputs.
 *
 * `norms` is optional: the RATES tab carries CARTON_MIN_M2 (C53) and
 * KD_PACK_FACTOR (C54) as copies of the NORMS tab, so when norms are supplied
 * they are mirrored into the rate list (the load list for `bom_rates`). The
 * engine itself reads those two from `norms`, not from `rates`.
 */
export function deriveRates(inputs: RateInputs, norms?: Norms): Rates {
  const i = inputs;

  // C29 LAB_CARP = carp_pool x (1 - carp_deduct) / comp_m3
  const LAB_CARP = (i.carp_pool * (1 - i.carp_deduct)) / i.comp_m3;

  // C30-C34 teak: (log_teak + processing) x yield + LAB_CARP
  const teak = (yieldFactor: number) => (i.log_teak + i.processing) * yieldFactor + LAB_CARP;
  // C35-C39 mindi: (log_mindi + processing) x yield + LAB_CARP
  const mindi = (yieldFactor: number) => (i.log_mindi + i.processing) * yieldFactor + LAB_CARP;

  // C42-C45 finishing, four rates
  const FIN_MAT = i.paint_total / i.fin_m2;
  const SAND_MAT = i.abrasive_total / i.fin_m2;
  const SAND_LAB = (i.sand_pool * i.sand_keep) / i.fin_m2;
  const FIN_LAB = i.fin_pool / i.fin_m2;

  const rates: Rates = {
    LAB_CARP,

    TEAK_A: teak(i.yield_A),
    TEAK_AC: teak(i.yield_AC),
    TEAK_B: teak(i.yield_B),
    TEAK_C: teak(i.yield_C),
    TEAK_D: teak(i.yield_D),

    MINDI_A: mindi(i.yield_A),
    MINDI_AC: mindi(i.yield_AC),
    MINDI_B: mindi(i.yield_B),
    MINDI_C: mindi(i.yield_C),
    MINDI_D: mindi(i.yield_D),

    // C40 meranti: sawn price x yield + labour, no processing
    MERANTI: i.meranti_sawn * i.yield_MER + LAB_CARP,

    // C41 rule T3
    FASTENERS: i.fast_total / i.comp_m3,

    FIN_MAT,
    SAND_MAT,
    SAND_LAB,
    FIN_LAB,
    // C46 FIN_ALL = the four rates above
    FIN_ALL: FIN_MAT + SAND_MAT + SAND_LAB + FIN_LAB,

    CARTON_M2: i.carton_m2,
    PACK_LAB: i.pack_lab,
    GRP_A: i.grp_a,

    MISC_PCT: i.misc_pct,
    // C51 OH_PCT = oh_pool / stmv_direct
    OH_PCT: i.oh_pool / i.stmv_direct,

    USD_IDR: i.usd_idr,
  };

  if (norms) {
    if (norms.CARTON_MIN_M2 !== undefined) rates.CARTON_MIN_M2 = norms.CARTON_MIN_M2;
    if (norms.KD_PACK_FACTOR !== undefined) rates.KD_PACK_FACTOR = norms.KD_PACK_FACTOR;
  }

  return rates;
}

/* -------------------------------------------------------------------------- */
/* Panel sheet prices — C1.1 PANEL_SHEETS tab                                  */
/* -------------------------------------------------------------------------- */

export const PANEL_THICKNESSES = [3, 6, 9, 12, 15, 18, 24] as const;
export const PANEL_FACES = ["RAW", "MSF", "MDF", "TSF", "TDF"] as const;

/** Base figures of the PANEL_SHEETS tab (C1.1 INPUTS C24-C37). */
export interface PanelRateInputs {
  /** C24 sheet length, m */
  sheet_L: number;
  /** C25 sheet width, m */
  sheet_W: number;
  /** C26 Adino glue + gum tape per m2 veneered, IDR/m2 */
  glue_tape: number;
  /** C27 teak veneer per running metre, IDR/m */
  ven_teak: number;
  /** C28 mindi veneer per running metre, IDR/m */
  ven_mindi: number;
  /** C29 veneer length used per face, m */
  ven_len: number;
  /** C30 pressing labour per face, IDR/face */
  ven_labour: number;
  /** C31-C37 raw board price per sheet, IDR, keyed by thickness in mm */
  ply: Record<number, number>;
}

/**
 * The 35 `PLY-<t>-<face>` sheet prices.
 * MDF / TDF here are the face codes (double face), not the board material.
 */
export function derivePanelRates(inputs: PanelRateInputs): Rates {
  const sheetArea = inputs.sheet_L * inputs.sheet_W; // B5
  const gluePerFace = inputs.glue_tape * sheetArea; // B6
  const teakVeneerPerFace = inputs.ven_teak * inputs.ven_len; // B7
  const mindiVeneerPerFace = inputs.ven_mindi * inputs.ven_len; // B8
  const labourPerFace = inputs.ven_labour; // B9
  const teakAdd = teakVeneerPerFace + gluePerFace + labourPerFace; // B10
  const mindiAdd = mindiVeneerPerFace + gluePerFace + labourPerFace; // B11

  const rates: Rates = {};
  for (const t of PANEL_THICKNESSES) {
    const raw = inputs.ply[t];
    if (raw === undefined) continue;
    rates[`PLY-${t}-RAW`] = raw;
    rates[`PLY-${t}-MSF`] = raw + mindiAdd;
    rates[`PLY-${t}-MDF`] = raw + 2 * mindiAdd;
    rates[`PLY-${t}-TSF`] = raw + teakAdd;
    rates[`PLY-${t}-TDF`] = raw + 2 * teakAdd;
  }
  rates.VENEER_M2 = inputs.glue_tape;
  return rates;
}
