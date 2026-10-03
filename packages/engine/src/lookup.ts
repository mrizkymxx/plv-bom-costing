/**
 * Required lookups into the rates / norms objects.
 *
 * CLAUDE.md rule 1: every threshold comes from `norms`, every price from
 * `rates`. A missing key is a configuration error, not a zero — these throw
 * rather than letting the cost silently become NaN.
 */

import type { Norms, Rates } from "./types";

export function rateOf(rates: Rates, code: string): number {
  const value = rates[code];
  if (value === undefined) throw new Error(`Missing rate: ${code}`);
  return value;
}

export function normOf(norms: Norms, code: string): number {
  const value = norms[code];
  if (value === undefined) throw new Error(`Missing norm: ${code}`);
  return value;
}
