/**
 * The verified reference set, exported so a caller can answer "what does this
 * rate change do?" without a database.
 *
 * These four items reproduce C4.3 line for line to the rupiah with the base
 * figures below. That is what makes them useful outside the tests: edit a base
 * figure, re-derive the rates, re-cost these items, and the difference against
 * `expected_unit_cost` is the honest effect of the change.
 *
 * Fixtures are JSON, so this module stays pure: no I/O, nothing read at runtime.
 */

import rateInputsJson from "../fixtures/rate-inputs-2026-09-29.json";
import panelInputsJson from "../fixtures/panel-inputs-2026-09-29.json";
import normsJson from "../fixtures/norms-2026-09-30.json";
import ov505b from "../fixtures/ov-505b.json";
import idOv506 from "../fixtures/id-ov-506.json";
import tb02 from "../fixtures/tb-02.json";
import aa04b from "../fixtures/aa-04b.json";

import type { RateInputs, PanelRateInputs } from "./derive";
import type { BomInput, Norms } from "./types";

/** The 27 base figures of C1.5, rates_version 2026-09-29. */
export const REFERENCE_RATE_INPUTS = rateInputsJson as unknown as RateInputs;

/** The PANEL_SHEETS base figures of C1.1. */
export const REFERENCE_PANEL_INPUTS = panelInputsJson as unknown as PanelRateInputs;

/** The 17 norms of C1.3 plus the two added on 30 Sep. */
export const REFERENCE_NORMS = normsJson as unknown as Norms;

export interface ReferenceItem {
  code: string;
  name: string;
  /** Project quantity as the stack test records it. */
  project_qty: number;
  input: BomInput;
  /** C4.3 unit cost with the base figures above, tier rule 2026-09-30. */
  expected_unit_cost: number;
  /** Which part of the rule set this item is the witness for. */
  covers: string;
}

/**
 * Ordered so the two slatted items come first: they are the ones the tier rule
 * moves most, so a tier-rate change shows up there first.
 */
export const REFERENCE_ITEMS: ReferenceItem[] = [
  {
    code: "OV-505 B",
    name: "Shelf below vanity counter",
    project_qty: 236,
    input: ov505b as unknown as BomInput,
    expected_unit_cost: 725983,
    covers: "slats under the 40 x 40 narrow rule, flatpack box rows",
  },
  {
    code: "ID-OV-506",
    name: "Shelf, overwater villa",
    project_qty: 109,
    input: idOv506 as unknown as BomInput,
    expected_unit_cost: 766148,
    covers: "a 275 mm wide board, carton from the overall size",
  },
  {
    code: "TB-02",
    name: "Side table, base and leg",
    project_qty: 118,
    input: tb02 as unknown as BomInput,
    expected_unit_cost: 1484874,
    covers: "a turned post at tier A-CURVED, bought-in labour, half a carton per unit",
  },
  {
    code: "AA-04B",
    name: "Vanity mirror, overwater",
    project_qty: 91,
    input: aa04b as unknown as BomInput,
    expected_unit_cost: 2538936,
    covers: "panel nesting and the 25% offcut rule, mindi at three different tiers",
  },
];
