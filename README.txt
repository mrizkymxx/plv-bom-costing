BOM engine (TypeScript, zero dependencies, no I/O)

packages/engine/src      source code (cost.ts, derive.ts, tier.ts, panel.ts, finishing.ts, packing.ts, lookup.ts, types.ts)
packages/engine/test     488 tests, incl. stack12.test.ts = Ryan's 12-item stack test to the rupiah
packages/engine/fixtures input figures and expected results used by the tests
docs/SPEC-costing-system.md   the rules (rate card C1, template C2, stack test C4)
docs/OPEN-DEFAULTS.md          which parameters wait for an owner decision
CLAUDE.md                      project rules

Run: npm install && npm test (in packages/engine). Source is from the main branch of github.com/it-tala/BOM-module (commit 415d849).
