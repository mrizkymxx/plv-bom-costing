# Open defaults — Evin's questions as data, not code

One row per question in `docs/EVIN-QUESTIONS.md` (Q-1 … Q-27). Goal: when Evin
answers, the answer is entered as a new rate version (or, where noted, needs
code first) — never a code change to the engine's formulas.

Finding from this pass: every number in Part 1 (Q-1 to Q-5, the rate-freeze
blockers) was **already** a named row in the rate card before this task —
`comp_m3`, `FIN_EXPOSED_ONLY`, `yield_A/B/D`, `stmv_direct`, `log_teak`,
`log_mindi` — because CLAUDE.md rule 1 ("every threshold comes from `norms`,
every price from `rates`, no magic numbers in engine code") was already
enforced throughout `packages/engine/src/**`. There was nothing hard-coded to
move. What this task did for Part 1 is cosmetic but real: it tags the affected
rate-card rows with "Default, owner decision pending (Q-n)" so the `/rates`
screen shows, quietly, which numbers are provisional (see step 5 below) —
`app/src/db/seed-data.ts` source/rule text only, no `value`s changed, so
`npm run verify` and the two reference items (OV-505 B 725,983 / ID-OV-506
766,148) stay exact.

Most of Part 2 and all of Part 3 are **not** numbers waiting in the rate card
— they are cost drivers the engine has no field, line type or formula for at
all (CLAUDE.md rule / task step 3: "paint recipes, laminated ply, CNC, edge
banding, crates, joints" — do not build). Those rows are marked "code" below.
A few (hardware catalogue prices for named items) need a figure but no code,
since `HARDWARE_SEED` / `hardware_catalog` already accept arbitrary rows.

| Q-n | Question (short) | Parameter name | Current default | Where it is set | Answer changes |
|---|---|---|---|---|---|
| Q-1 | Carpentry labour: component m3 or rough-sawn m3? | `comp_m3` (feeds `LAB_CARP`) | 32.56 m3, component basis | `app/src/db/seed-data.ts` `RATE_INPUT_META.comp_m3`; `packages/engine/src/derive.ts` `LAB_CARP` | data (switching to rough-sawn basis also needs the yield factors rebuilt — a methodology change, still just new base-figure values) |
| Q-2 | Finishing area: one face or all faces? | `FIN_EXPOSED_ONLY` | 1 (one face) | `app/src/db/seed-data.ts` `NORM_META.FIN_EXPOSED_ONLY`; `packages/engine/src/finishing.ts` | data — both formulas are already implemented behind the flag (CLAUDE.md rule 5) |
| Q-3 | Tier yields A 3.5 / B 2.5 / D 1.5 correct? | `yield_A`, `yield_B`, `yield_D` | A 3.5, B 2.5, D 1.5 | `app/src/db/seed-data.ts` `RATE_INPUT_META.yield_A/B/D` | data |
| Q-4 | Overhead denominator: reconciliation or rate-built direct cost? | `stmv_direct` (feeds `OH_PCT`) | 2,374,841,837 IDR (STMV reconciliation) | `app/src/db/seed-data.ts` `RATE_INPUT_META.stmv_direct`; `packages/engine/src/derive.ts` `OH_PCT` | data if the reconciliation figure is revised; **code** if switching to the "rate-built" denominator, since that number does not exist yet — it would have to come from re-costing every STMV item under the new rates and summing, which is a new batch tool, not a base figure |
| Q-5 | Teak/mindi log price: ledger or 30 Sep nota? | `log_teak`, `log_mindi` | 10,900,000 / 3,100,000 IDR/m3 | `app/src/db/seed-data.ts` `RATE_INPUT_META.log_teak/log_mindi` | data |
| Q-6 | Rate per finish recipe (paint/duco/PU vs natural)? | none — `FIN_MAT/SAND_MAT/SAND_LAB/FIN_LAB` are flat, `header.finish_recipe` is carried but unread by the engine | one flat rate for every recipe | `app/src/db/seed-data.ts` `RATE_META.FIN_MAT` etc.; `packages/engine/src/finishing.ts` (no recipe lookup); `packages/engine/src/types.ts` `Header.finish_recipe` | code — needs a rate keyed by recipe and a lookup in `finishingCost` |
| Q-7 | Primer/dempul in the paint recipe rate? | none | excluded | — | code (folds into Q-6) |
| Q-8 | Count edge area on thick painted panels? | none | not counted | `packages/engine/src/finishing.ts` `finishingM2` | code — new term (perimeter x T, and pi x D x T for holes) |
| Q-9 | How to enter laminated build-up panels? | none | not modelled | `packages/engine/src/types.ts` `PanelLine` (one type, one T) | code |
| Q-10 | Lamination labour + glue rate per m2? | none | no rate | `packages/engine/src/derive.ts` `derivePanelRates` | data, but needs Q-9's code first |
| Q-11 | Joint rule for panels bigger than one sheet? | none | blocked, check = "panel bigger than sheet" | `packages/engine/src/panel.ts` `computePanel` / `piecesPerSheet` | code |
| Q-12 | Add non-standard panel thickness (7 mm, etc.)? | `PANEL_THICKNESSES` (literal array); `PanelRateInputs.ply` | only 3/6/9/12/15/18/24 mm priced | `packages/engine/src/derive.ts` `PANEL_THICKNESSES`; `app/src/db/seed-data.ts` `PANEL_RATE_INPUTS.ply` | data + a one-line code change (the thickness list is a literal array, not a rate-card row, so a new thickness needs both a price and that line edited) |
| Q-13 | Which non-plywood boards to price? | none | only plywood RAW/MSF/MDF/TSF/TDF | `packages/engine/src/derive.ts` `PANEL_FACES` | code |
| Q-14 | Edge banding / lipping rate? | none | not costed | — | code |
| Q-15 | Rate for CNC/router cut-outs? | none | not costed | — | code |
| Q-16 | Does panel labour already sit in the pressing rate? | `carp_deduct` | 10% (Decision 29 Sep) | `app/src/db/seed-data.ts` `RATE_INPUT_META.carp_deduct` | data to confirm/adjust the %; code only if a separate per-panel labour line is wanted instead |
| Q-17 | Double-charge in-house labour on outside-turned parts? | none (behavioural ruling) | both charged | `packages/engine/src/cost.ts` (no special case) | code, if changed to strip or net the in-house labour on a flagged line |
| Q-18 | Panel track system price? | none | guessed hardware price | `app/src/db/seed-data.ts` `HARDWARE_SEED` | data — `HARDWARE_SEED` / `hardware_catalog` already take any item, just add the row once sourced |
| Q-19 | Curtain rail price? | none | guessed hardware price | `app/src/db/seed-data.ts` `HARDWARE_SEED` | data |
| Q-20 | Curtain fabric + sewing rate? | none | guessed, no rate | — | code — needs a soft-goods rate (fabric x fullness + sewing per panel), not a flat unit price |
| Q-21 | Crate rate for large/heavy items? | none | carton only | `packages/engine/src/packing.ts` | code |
| Q-22 | Which thickness governs on a build-up mismatch? | none | not detected | `packages/engine/src/panel.ts` (checks T against panel type, not against a ply sum) | code |
| Q-23 | Rate refresh / re-submit / locking / audit log? | none (process) | not specified | — | process; code once a rule is picked |
| Q-24 | How to cost buy-out/subcontract items (~2/3 of PLV)? | none | manual vendor-price lines (current default, option a) | `app/src/lib/bom.ts` hardware line costing (already supports this) | process / data — the current default needs no change; a catalogue-markup path (option b) would need code |
| Q-25 | Who resolves PLV drawing conflicts? | none (process) | escalate to Avisha/Raffi | — | process, not data or code |
| Q-26 | Which unit governs quantity-basis mismatches (QTY/DOOR SET)? | none | warning only, not enforced | `packages/engine/src/types.ts` `Header`; drawing read path | code — new header multiplier field |
| Q-27 | Installation fixings in or out of item cost? | none (process) | out, project-level line | — | process; code only if brought into the item cost |

## Step 5 — rate-card screen annotations

The `/rates` screen (`app/src/app/rates/RateEditor.tsx`, `app/src/app/rates/page.tsx`)
already renders each base figure's and derived rate's `source` text (and each
norm's `rule` text) from `app/src/db/seed-data.ts`. For every row above whose
parameter already exists in the rate card (Q-1 through Q-6, Q-16), that text
now ends with "Default, owner decision pending (Q-n)." — small, quiet, no new
colour, no new component:

- Base figures table: a third muted line under the figure's code
  (`.rate-edit td.fig-cell .fig-note`), shown only on rows carrying the tag.
- "In force now → Rates" table: already shown in the existing Description
  column (`row.source`).
- "In force now → Norms" table: already shown in the existing "Used by rule"
  column (`row.rule`), for `FIN_EXPOSED_ONLY`.

Rows with no rate-card parameter (everything marked "code" or "process" above)
have nothing to annotate — they do not appear on `/rates` at all yet.
