/**
 * The exported reference set must stay true, because the rate screen uses it to
 * tell an estimator what a rate change does. If these drift, that screen lies.
 */

import {
  REFERENCE_ITEMS,
  REFERENCE_NORMS,
  REFERENCE_PANEL_INPUTS,
  REFERENCE_RATE_INPUTS,
  costItem,
  derivePanelRates,
  deriveRates,
} from "../src/index";

const rates = {
  ...deriveRates(REFERENCE_RATE_INPUTS, REFERENCE_NORMS),
  ...derivePanelRates(REFERENCE_PANEL_INPUTS),
};

describe("the exported reference set", () => {
  test("carries the four verified items", () => {
    expect(REFERENCE_ITEMS.map((i) => i.code)).toEqual([
      "OV-505 B",
      "ID-OV-506",
      "TB-02",
      "AA-04B",
    ]);
  });

  test.each(REFERENCE_ITEMS.map((i) => [i.code, i] as const))(
    "%s still costs its recorded unit cost",
    (_code, item) => {
      const r = costItem(item.input, rates, REFERENCE_NORMS);
      expect(Math.round(r.unit_cost)).toBe(item.expected_unit_cost);
      expect(r.ok).toBe(true);
      expect(r.checks).toEqual([]);
    },
  );

  test("the recorded project quantity is the one in the fixture header", () => {
    for (const item of REFERENCE_ITEMS) {
      expect(item.input.header.project_qty).toBe(item.project_qty);
    }
  });

  test("a change to a base figure moves the unit cost, which is the point", () => {
    const dearer = { ...REFERENCE_RATE_INPUTS, log_teak: REFERENCE_RATE_INPUTS.log_teak * 1.1 };
    const moved = {
      ...deriveRates(dearer, REFERENCE_NORMS),
      ...derivePanelRates(REFERENCE_PANEL_INPUTS),
    };
    const before = costItem(REFERENCE_ITEMS[0]!.input, rates, REFERENCE_NORMS).unit_cost;
    const after = costItem(REFERENCE_ITEMS[0]!.input, moved, REFERENCE_NORMS).unit_cost;
    expect(after).toBeGreaterThan(before);
    // Mindi and panel items must not move when only the teak price changes.
    const mindiBefore = costItem(REFERENCE_ITEMS[3]!.input, rates, REFERENCE_NORMS).unit_cost;
    const mindiAfter = costItem(REFERENCE_ITEMS[3]!.input, moved, REFERENCE_NORMS).unit_cost;
    expect(mindiAfter).toBe(mindiBefore);
  });
});
