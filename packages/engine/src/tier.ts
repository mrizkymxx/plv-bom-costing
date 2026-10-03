/**
 * Rule T1 — automatic timber tier.
 *
 * "2026-09-30" is the 7-step order of C1.5 (with the NARROW step).
 * "2026-09-29" is column N of C2.5 (same order without the NARROW step).
 */

import { normOf } from "./lookup";
import type { Norms, SolidLine, Tier, TierRuleVersion } from "./types";

/** Excel MEDIAN of three numbers: the middle value. */
export function median3(a: number, b: number, c: number): number {
  return a + b + c - Math.min(a, b, c) - Math.max(a, b, c);
}

/**
 * Returns the tier for one solid line, or null when the line is empty
 * (sheet formula: `=IF(D{r}="","",...)`).
 */
export function autoTier(
  line: SolidLine,
  norms: Norms,
  version: TierRuleVersion = "2026-09-30",
): Tier | null {
  const { l, w, t } = line;
  if (l === undefined || l === null) return null;

  // 1. Tier override filled -> use the override.
  if (line.tier_override) return line.tier_override;

  if (w === undefined || w === null || t === undefined || t === null) return null;

  const maxDim = Math.max(l, w, t);
  const volOnePiece = (l * w * t) / 1e9;

  // 2. Volume of one piece < TIER_D_MAX_VOL AND longest side < TIER_D_MAX_LEN -> D.
  if (volOnePiece < normOf(norms, "TIER_D_MAX_VOL") && maxDim < normOf(norms, "TIER_D_MAX_LEN")) {
    return "D";
  }

  // 3. Not exposed -> C.
  if (line.exposed === "N") return "C";

  // 4. Curved -> A-CURVED.
  if (line.curved === "Y") return "A-CURVED";

  // 5. (30 Sep only) section 40 x 40 or less, up to 1500 mm long -> B.
  if (version === "2026-09-30") {
    if (
      median3(l, w, t) <= normOf(norms, "NARROW_MAX_SECTION") &&
      maxDim <= normOf(norms, "NARROW_MAX_LEN")
    ) {
      return "B";
    }
  }

  // 6. Longest side >= TIER_A_MIN_LEN -> A.
  if (maxDim >= normOf(norms, "TIER_A_MIN_LEN")) return "A";

  // 7. Otherwise -> B.
  return "B";
}

/**
 * Rate code for a solid line — C2.5 column R / CLAUDE.md rule 9.
 * species + "_" + tier, with "A-CURVED" collapsed to "AC". MERANTI ignores the tier.
 */
export function solidRateCode(material: string | undefined, tier: Tier | null): string | null {
  if (!material || !tier) return null;
  if (material === "MERANTI") return "MERANTI";
  return `${material}_${tier.replace("-CURVED", "C")}`;
}
