# BOM Module (PLV costing) — project context for Claude Code

Standalone webapp. No relation to any other repo. Goal: cost furniture items from component take-off using a rate card, matching a reference stack test TO THE RUPIAH.

## Read first
- PLAN.md — targets T1–T7, stack, schema, UI principles
- docs/SPEC-costing-system.md — C1 rate card (inputs, derived rates, norms, rules T1–S1), C2 Template v2 layout, C4 stack test with fixtures and expected numbers
- docs/SPEC-registers.md — D1 decisions, D2 findings, D3 open questions (defaults in force), D4 glossary
Do NOT read File/PLV-BOM-Complete-Export-2026-09-30.md (2.6 MB; the docs above are the relevant cut).

## Stack
- npm workspaces: `packages/engine` (pure TS, zero deps, no I/O) and root webapp (Next.js 15 App Router, TS strict, Tailwind CSS, Supabase client)
- Database & Sync: Supabase PostgreSQL (schema in `supabase_schema.sql`, client in `src/lib/supabase.ts`)
- Tests & Verification: Vitest. Run `npm test` at root (engine), `npm run verify` (typecheck + test), and `npm run build` (production build).
- Windows host, bash (git-bash). Use forward-slash paths. No `python3`; `python` exists.

## Non-negotiable rules
1. Every threshold comes from a `norms` object, every price from a `rates` object. No magic numbers in engine code.
2. Numbers are unrounded internally (JS number is fine; do NOT round until presentation). Tests compare `Math.round(x)` to the expected rupiah.
3. Tier rule T1 order is exactly C1.5 (30 Sep version, 7 steps). The 29 Sep version (no NARROW step) must also be available via a flag (`tierRuleVersion: "2026-09-29" | "2026-09-30"`).
4. Finishing = four separate lines FIN_MAT, SAND_MAT, SAND_LAB, FIN_LAB (C1.5 F2 revised).
5. Finishing m² as implemented in the stack test (C1.5 "F1 as implemented"): Σ solid lines with exposed=Y of L×W×qty (one face) + Σ panel lines of L×W×qty×exposed_faces. Also implement the "all faces" alternative behind norm `FIN_EXPOSED_ONLY` (1 = one face, 0 = all faces of exposed components, 2(LW+LT+WT)×qty).
6. Packing K1/K2 exactly as the TOTAL row formulas in C2.4 and summary row 92 in C2.8: if no box rows → one carton from overall L/W/H + CARTON_ADD; `if (m2 < CARTON_MIN_M2) GRP_A × cartons else m2 × CARTON_M2 × (1 + (cartons > 1 ? KD_PACK_FACTOR : 0))` + `m3 × PACK_LAB`. Box qty may be fractional (TB-02 used 0.5).
7. Rates are rows with `valid_from`; never update in place. Submitted BOMs store rate_code + rate_value per line and are never re-costed.
8. Naming: English identifiers; UI labels may be English (as in Template v2). Rate codes exactly as C1.5: TEAK_A, TEAK_AC, TEAK_B, TEAK_C, TEAK_D, MINDI_A, MINDI_AC, MINDI_B, MINDI_C, MINDI_D, MERANTI, LAB_CARP, FASTENERS, FIN_MAT, SAND_MAT, SAND_LAB, FIN_LAB, FIN_ALL, CARTON_M2, PACK_LAB, GRP_A, MISC_PCT, OH_PCT, CARTON_MIN_M2, KD_PACK_FACTOR, USD_IDR. Panel rates: `PLY-<t>-<face>` (t ∈ 3,6,9,12,15,18,24; face ∈ RAW,MSF,MDF,TSF,TDF). Note MDF here = Mindi Double Face, not the board material.
9. Tier rate lookup: species + "_" + tier with "A-CURVED" → "AC" (so TEAK + A-CURVED → TEAK_AC). MERANTI ignores tier. Species OTHER → `rate?` check error.
10. When a number does not match the reference, do not fudge the formula to hit the number. Report the per-line difference (C4.3 gives line-level expected values) and stop.

## UI (no fixed ruleset — 2 Oct 2026, owner instruction)
There is no prescriptive design-rule document for this app anymore (the old "office look" rules and the Notion-rebuild rules are both retired; the `ui-ux-pro-max` skill is removed from this repo). Use judgment per screen instead: easy to use for a non-technical estimator, responsive, genuinely well-designed rather than generic-looking ("anti AI slop" — the owner's words), with working export where the screen calls for it. Dense numeric tables stay right-aligned with thousand separators. Prefer reusing the tokens/components already in `app/src/app/globals.css` and `app/src/components/` for consistency, but they are a convenience, not a mandate.

## Verification before claiming done
Run `npm run verify` and paste the real output. Never report a test as passing without running it.
