# PART C — THE COSTING SYSTEM

**Provenance of this part.** The two Day-1 deliverables (`PLV_BOM_Rate_Card_and_Rule_Spec_29Sep26.xlsx` and `PLV_BOM_Input_Template_v2.xlsx`) were handed over as Excel downloads on 29 Sep 2026. They are not among the project files and were not found in Google Drive. Sections C1 and C2 are therefore **[REBUILT]** from the build scripts recorded in the conversation of 29 Sep: the scripts hold every label, value, formula and cell position, and the values below were recalculated from them without rounding. They match the figures reported on the day (for example teak tier A 47.7 jt, overhead 13.0%). The 30 Sep revisions come from the stack-test build script of 30 Sep. Section C4 comes from the SUMMARY tab of the Google Sheet `PLV_BOM_Stack_Test_12_Items_30Sep26` **[DRIVE]**.

## C1. Rate Card and Rule Spec 29 Sep 26

Workbook tabs, in order: `INPUTS` → `TIER_CALC` → `PANEL_SHEETS` → `RATES` → `NORMS` → `RULES` → `OPEN_ITEMS`.

Status legend used on every tab: **SET** (green) = set from the STMV ledger or payroll · **CONFIRM** (yellow) = estimate, check against nota or invoice · **DECISION** (orange) = management judgement. Blue font = an input that can be changed.

### C1.1 Base inputs and derived rates

#### Rate Card tab `INPUTS` (cells A5:F53)

Title A1: "PLV BOM rate build — base figures from STMV (Standard Maldives) actuals, Mar–Sep 2026". A2: "Prepared 29 Sep 2026. Every rate on the RATES tab is a formula on these cells. Change a blue cell and the rates update." A3 (legend): "Legend: blue = input you can change · green = SET from STMV ledger/payroll · yellow = CONFIRM (estimate, check against nota/invoice) · orange = DECISION (management judgement)". Row 5 = header.

| Cell | Code | Input (description) | Value | Unit | Source / derivation | Status |
|---|---|---|---|---|---|---|
| A6 | **WOOD** (section row) | | | | | |
| C7 | `log_teak` | Teak log price, implied | 10,900,000 | IDR/m³ | Ledger 152.3m ÷ 14 m³ bought by 21 May (BOM "sudah beli"). Replace with nota price. | CONFIRM |
| C8 | `log_mindi` | Mindi log price, implied | 3,100,000 | IDR/m³ | Ledger 126.1m ÷ 41 m³ bought by 21 May. Replace with nota price. | CONFIRM |
| C9 | `meranti_sawn` | Meranti dry sawn timber, delivered | 8,500,000 | IDR/m³ | STMV BOM price (64,058,920 ÷ 7.54 m³). No kiln/sawmill. Confirm from nota. | CONFIRM |
| C10 | `processing` | Wood processing (kiln + sawmill + hauling + in-house sawmill staff) | 598,978 | IDR/m³ log | Ledger 43,108,500 + sawmill staff ÷ 75.82 m³ teak+mindi rough need. Applied per m³ of log, i.e. × yield. | SET |
| C11 | `comp_teak` | STMV teak in components | 12.21 | m³ | REVISI BOM 21 MEI 26, produced versions only | SET |
| C12 | `comp_mindi` | STMV mindi in components | 13.15 | m³ | REVISI BOM 21 MEI 26 | SET |
| C13 | `comp_meranti` | STMV meranti in components | 7.2 | m³ | Door kusen + leaves + partition | SET |
| A14 | **LABOUR (payroll Mar–Sep 2026, categorised by name 29 Sep)** (section row) | | | | | |
| C15 | `carp_pool` | Carpentry pool, total paid (sample makers, tukang, Ramlan, Sunarno) | 270,175,017 | IDR | W_CATEGORY labour workbook, 12 people, 860 days | SET |
| C16 | `carp_deduct` | Deduction for panel cutting/pressing already in panel rate | 10% (stored 0.1) | % | Decision 29 Sep | DECISION |
| C17 | `fin_pool` | Finishing pool excl. sanding (finishing, PU, gerinda, Nur, Muslikhin) | 192,243,271 | IDR | Same workbook, 24 people | SET |
| C18 | `sand_pool` | Sanding pool, as paid | 131,550,191 | IDR | Same workbook, 26 people | SET |
| C19 | `sand_keep` | Sanding share kept (35% removed: bleach re-sanding + packing work) | 65% (stored 0.65) | % | Decision 29 Sep | DECISION |
| A20 | **FINISHING MATERIALS** (section row) | | | | | |
| C21 | `fin_mat` | Zhanchen all (52,888,326) + thinner (31,249,000) + abrasives (27,713,000) | 111,850,326 | IDR | Ledger, agreed 28 Sep. Excludes KSA/Sayerlac, WA-250 bleach, Marguard sundries, brushes, dempul. | SET |
| C22 | `fin_m2` | STMV finishing surface (guest-room furniture + 122 doorsets at 6 m²) | 2,166 | m² | Items tab estimate — same basis for material and labour rate | SET |
| A23 | **VENEERED PLYWOOD** (section row) | | | | | |
| C24 | `sheet_L` | Plywood sheet length | 2.44 | m | Standard sheet | SET |
| C25 | `sheet_W` | Plywood sheet width | 1.22 | m |  | SET |
| C26 | `glue_tape` | Adino glue + gum tape per m² veneered | 10,424 | IDR/m² | 3,912,750 + 600,000 ÷ 432.9 m² (122 doors × 2 faces) | SET |
| C27 | `ven_teak` | Teak veneer, per running metre (1.35 m wide) | 110,000 | IDR/m | User, 28 Sep | CONFIRM |
| C28 | `ven_mindi` | Mindi veneer, per running metre | 20,000 | IDR/m | User, 28 Sep. Confirm ≥1.22 m wide | CONFIRM |
| C29 | `ven_len` | Veneer length used per face | 2.5 | m | One 2.5 m sheet per face, offcuts not reused | CONFIRM |
| C30 | `ven_labour` | Pressing labour per face (tape, press, sand, cut) | 57,142.86 | IDR/face | 800,000 ÷ 14 sheets | CONFIRM |
| C31 | `ply3` | Plywood Comby Better 3 mm | 77,500 | IDR/sheet | Mojo Indah list, Sep 2026 | SET |
| C32 | `ply6` | Plywood 6 mm | 115,000 | IDR/sheet | Mojo Indah list, Sep 2026 | SET |
| C33 | `ply9` | Plywood 9 mm | 172,500 | IDR/sheet | Mojo Indah list, Sep 2026 | SET |
| C34 | `ply12` | Plywood 12 mm | 215,000 | IDR/sheet | Mojo Indah list, Sep 2026 | SET |
| C35 | `ply15` | Plywood 15 mm | 260,000 | IDR/sheet | Mojo Indah list, Sep 2026 | SET |
| C36 | `ply18` | Plywood 18 mm | 295,000 | IDR/sheet | Mojo Indah list, Sep 2026 | SET |
| C37 | `ply24` | Plywood 24 mm | 375,000 | IDR/sheet | Extrapolated (not on Comby list); Meranti TM 24 mm listed at 500,000 | CONFIRM |
| A38 | **PACKING** (section row) | | | | | |
| C39 | `carton_m2` | Carton + 40% share of non-carton consumables, per m² of board (6 sides) | 42,000 | IDR/m² | Cynthia cartons 59.4m + consumables 20.4m; groups B–D within 3% of this flat rate | SET |
| C40 | `pack_labour` | Packing labour per m³ of carton | 100,000 | IDR/m³ | 6 people × 8 days ≈ 6.5jt per container ÷ 65 m³ | CONFIRM |
| C41 | `noncarton_m3` | Non-carton packing (single face, foam, crate) incl. labour — reference only | 362,000 | IDR/m³ | 39.3m over ~150 m³ + 100k labour. Not used while all PLV items are cartoned. | SET |
| C42 | `grpA` | Carton group A, loaded price per carton | 24,000 | IDR | STMV carton groups workbook, 28 Sep | SET |
| C43 | `grpB` | Carton group B | 65,000 | IDR |  | SET |
| C44 | `grpC` | Carton group C | 145,000 | IDR |  | SET |
| C45 | `grpD` | Carton group D | 186,000 | IDR |  | SET |
| A46 | **FASTENERS & GLUE (assembly consumables)** (section row) | | | | | |
| C47 | `fast_total` | Screws, nails, dowels, wood glue — STMV ledger estimate | 57,000,000 | IDR | Hardware line 61.4m less brackets/gliders. Reconciliation 23 Sep. | CONFIRM |
| A48 | **OVERHEAD & MISC** (section row) | | | | | |
| C49 | `oh_payroll` | OVERHEAD payroll category (driver, security, office/admin monthly staff) | 213,627,079 | IDR | Labour workbook, 13 people, Mar–Sep | SET |
| C50 | `oh_util` | Factory electricity & utilities, ledger | 144,633,030 | IDR | Reconciliation 23 Sep, section B | SET |
| C51 | `oh_capex` | Less PLN capacity upgrade (one-off capex) | 49,700,000 | IDR | Reconciliation, overhead detail | SET |
| C52 | `stmv_direct` | STMV direct cost, components subtotal actual | 2,374,841,837 | IDR | Reconciliation section A (wood, panels, finishing, hardware, packing, production labour, bought-ins) | SET |
| C53 | `misc_pct` | Miscellaneous allowance | 5% (stored 0.05) | % | Decision 29 Sep | DECISION |

#### Rate Card tab `TIER_CALC`

A1: "Solid timber tier rates, IDR per m³ of finished component (yield, processing and labour built in)". A2: "Rate = (log price + processing) × yield factor + carpentry labour per component m³. Meranti: sawn price × yield + labour, no processing."

**Carpentry labour per m³ of component (rows 5–9)**

| Cell | Line | Value | Unit | Formula |
|---|---|---|---|---|
| C6 | Carpentry pool × (1 − panel deduction) | 243,157,515.30 | IDR | `=INPUTS!$C$15*(1-INPUTS!$C$16)` |
| C7 | STMV solid wood in components (teak + mindi + meranti) | 32.56 | m³ | `=INPUTS!$C$11+INPUTS!$C$12+INPUTS!$C$13` |
| C8 | Carpentry labour per m³ of component | 7,467,982.66 | IDR/m³ | `=C6/C7` |
| C9 | For reference: same pool ÷ rough-sawn requirement 83.36 m³ (superseded — see OPEN_ITEMS 1) | 2,916,956.76 | IDR/m³ | `=C6/83.36` |

**Tier table (header row 11, data rows 12–16)** — columns: A Tier · B Component type · C Yield factor (m³ log per m³ component) · D Teak: wood · E Teak: processing · F Teak: labour · G TEAK RATE per m³ · H MINDI RATE per m³ · I Basis for yield

| Row | Tier | Component type | Yield factor (C) | Teak: wood (D) | Teak: processing (E) | Teak: labour (F) | TEAK RATE per m³ (G) | MINDI RATE per m³ (H) | Basis for yield | Yield status | Formulas |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 12 | A | Exposed, straight, length ≥ 1000 mm | 3.5 | 38,150,000 | 2,096,423 | 7,467,982.66 | **47,714,405.66** | **20,414,405.66** | Estimate between STMV teak (2.0, all under 1.2 m) and STMV mindi curved/wide (4.6). No STMV type-A teak evidence. | DECISION | D12: `=INPUTS!$C$7*C12` ; E12: `=INPUTS!$C$10*C12` ; F12: `=TIER_CALC!$C$8` ; G12: `=D12+E12+F12` ; H12: `=(INPUTS!$C$8+INPUTS!$C$10)*C12+F12` |
| 13 | A-CURVED | Exposed, curved or wide board, any length | 4.6 | 50,140,000.00 | 2,755,298.80 | 7,467,982.66 | **60,363,281.46** | **24,483,281.46** | STMV mindi: 2.2 m architrave and curved mirror frames, 61 m³ bought ÷ 13.15 in components | SET | D13: `=INPUTS!$C$7*C13` ; E13: `=INPUTS!$C$10*C13` ; F13: `=TIER_CALC!$C$8` ; G13: `=D13+E13+F13` ; H13: `=(INPUTS!$C$8+INPUTS!$C$10)*C13+F13` |
| 14 | B | Exposed, straight, length < 1000 mm | 2.5 | 27,250,000 | 1,497,445 | 7,467,982.66 | **36,215,427.66** | **16,715,427.66** | STMV teak blended 2.0 straddles B and C; B set above, C below | DECISION | D14: `=INPUTS!$C$7*C14` ; E14: `=INPUTS!$C$10*C14` ; F14: `=TIER_CALC!$C$8` ; G14: `=D14+E14+F14` ; H14: `=(INPUTS!$C$8+INPUTS!$C$10)*C14+F14` |
| 15 | C | Not exposed (hidden frames, rails, cleats) | 2.0 | 21,800,000 | 1,197,956 | 7,467,982.66 | **30,465,938.66** | **14,865,938.66** | STMV teak: 24.8 m³ bought ÷ 12.21 in components | SET | D15: `=INPUTS!$C$7*C15` ; E15: `=INPUTS!$C$10*C15` ; F15: `=TIER_CALC!$C$8` ; G15: `=D15+E15+F15` ; H15: `=(INPUTS!$C$8+INPUTS!$C$10)*C15+F15` |
| 16 | D | Very small parts (see NORMS for threshold) — cut from offcuts | 1.5 | 16,350,000 | 898,467 | 7,467,982.66 | **24,716,449.66** | **13,016,449.66** | Offcut use; low log demand, labour per m³ high | DECISION | D16: `=INPUTS!$C$7*C16` ; E16: `=INPUTS!$C$10*C16` ; F16: `=TIER_CALC!$C$8` ; G16: `=D16+E16+F16` ; H16: `=(INPUTS!$C$8+INPUTS!$C$10)*C16+F16` |

**Meranti (rows 18–20)** — A18: "Meranti (dry sawn timber, no kiln/sawmill)".

| Cell | Line | Value | Formula / note |
|---|---|---|---|
| C19 | Sawn-to-component yield factor | 1.5 | input (orange = DECISION). I19: "Assumption: sawn boards lose less than logs. Confirm from STMV meranti nota (7.2 m³ in components)." |
| C20 | MERANTI RATE per m³ of component | 20,217,982.66 | `=INPUTS!$C$9*C19+TIER_CALC!$C$8` |

A22: "Check against the 27 Sep sketch (materials only): A 34jt · B 28jt · C 25jt · D 23jt. All-in rates above land at roughly A 48 · B 36 · C 30 · D 25 jt because labour is now inside the rate."

#### Rate Card tab `PANEL_SHEETS`

A1: "Veneered plywood, cost per full 2.44 × 1.22 m sheet (board + veneer + glue/tape + pressing labour). Cutting labour is in this rate."

**Per-face build-up (rows 4–11)**

| Cell | Line | Value | Formula |
|---|---|---|---|
| B5 | Sheet area (m²) | 2.9768 | `=INPUTS!$C$24*INPUTS!$C$25` |
| B6 | Glue + tape per face | 31,030.16 | `=INPUTS!$C$26*B5` |
| B7 | Teak veneer per face | 275,000 | `=INPUTS!$C$27*INPUTS!$C$29` |
| B8 | Mindi veneer per face | 50,000 | `=INPUTS!$C$28*INPUTS!$C$29` |
| B9 | Labour per face | 57,142.86 | `=INPUTS!$C$30` |
| B10 | Teak added cost per face | 363,173.02 | `=B7+B6+B9` |
| B11 | Mindi added cost per face | 138,173.02 | `=B8+B6+B9` |

**Per-sheet table (header row 13, rows 14–20)** — the 7 × 4 = 28 veneered prices plus the raw board. Face codes: RAW (no veneer), MSF / MDF (mindi single / double face), TSF / TDF (teak single / double face). Formulas per row r: B = `=INPUTS!$C$<ply row>`; C (MSF) = `=B{r}+$B$11`; D (MDF) = `=B{r}+2*$B$11`; E (TSF) = `=B{r}+$B$10`; F (TDF) = `=B{r}+2*$B$10`.

| Row | Thickness | Raw board (B) | Mindi single face (C) | Mindi double face (D) | Teak single face (E) | Teak double face (F) | Sheet code (G) | Note (H) | Raw board formula |
|---|---|---|---|---|---|---|---|---|---|
| 14 | 3 mm | 77,500 | 215,673.02 | 353,846.05 | 440,673.02 | 803,846.05 | PLY-3 | 9 mm back panels: in-house mindi SF beats Mojo Indah pre-veneered jati (345–380k) | `=INPUTS!$C$31` |
| 15 | 6 mm | 115,000 | 253,173.02 | 391,346.05 | 478,173.02 | 841,346.05 | PLY-6 |  | `=INPUTS!$C$32` |
| 16 | 9 mm | 172,500 | 310,673.02 | 448,846.05 | 535,673.02 | 898,846.05 | PLY-9 | Mojo Indah pre-veneered teak only good enough for 9 mm back panels | `=INPUTS!$C$33` |
| 17 | 12 mm | 215,000 | 353,173.02 | 491,346.05 | 578,173.02 | 941,346.05 | PLY-12 |  | `=INPUTS!$C$34` |
| 18 | 15 mm | 260,000 | 398,173.02 | 536,346.05 | 623,173.02 | 986,346.05 | PLY-15 |  | `=INPUTS!$C$35` |
| 19 | 18 mm | 295,000 | 433,173.02 | 571,346.05 | 658,173.02 | 1,021,346.05 | PLY-18 |  | `=INPUTS!$C$36` |
| 20 | 24 mm | 375,000 | 513,173.02 | 651,346.05 | 738,173.02 | 1,101,346.05 | PLY-24 | Board price extrapolated | `=INPUTS!$C$37` |

A22: "BOM use: panel type = sheet code + face type (RAW / MSF / MDF / TSF / TDF). Cost per panel = sheets consumed (see RULES P1–P4) × sheet price. Exposed veneered faces then get the finishing rate."

#### Rate Card tab `RATES` (the load list for `ops_prod.bom_rates`)

A1: "RATE CARD — values to load into Supabase ops_prod.bom_rates (rate_code, value, unit, valid_from = 2026-10-01, source)". A2: "All values are formulas on INPUTS / TIER_CALC / PANEL_SHEETS. Apps Script reads this tab (or Supabase, once loaded) into the BOM RATES tab." Header row 5; data from row 6.

| Cell | rate_code | Description | Value (calculated, not rounded) | Unit | Formula | Applied to | Status |
|---|---|---|---|---|---|---|---|
| A6 | **SOLID TIMBER — per m³ of component (yield, processing, carpentry labour inside)** (section row) | | | | | | |
| C7 | `TEAK_A` | Teak tier A, exposed ≥ 1000 mm | 47,714,405.6566 | IDR/m³ | `=TIER_CALC!G12` | Component m³ × rate | DECISION |
| C8 | `TEAK_AC` | Teak tier A-curved / wide | 60,363,281.4566 | IDR/m³ | `=TIER_CALC!G13` | Component m³ × rate | SET |
| C9 | `TEAK_B` | Teak tier B, exposed < 1000 mm | 36,215,427.6566 | IDR/m³ | `=TIER_CALC!G14` | Component m³ × rate | DECISION |
| C10 | `TEAK_C` | Teak tier C, not exposed | 30,465,938.6566 | IDR/m³ | `=TIER_CALC!G15` | Component m³ × rate | SET |
| C11 | `TEAK_D` | Teak tier D, very small parts | 24,716,449.6566 | IDR/m³ | `=TIER_CALC!G16` | Component m³ × rate | DECISION |
| C12 | `MINDI_A` | Mindi tier A | 20,414,405.6566 | IDR/m³ | `=TIER_CALC!H12` | Component m³ × rate | DECISION |
| C13 | `MINDI_AC` | Mindi tier A-curved / wide | 24,483,281.4566 | IDR/m³ | `=TIER_CALC!H13` | Component m³ × rate | SET |
| C14 | `MINDI_B` | Mindi tier B | 16,715,427.6566 | IDR/m³ | `=TIER_CALC!H14` | Component m³ × rate | DECISION |
| C15 | `MINDI_C` | Mindi tier C | 14,865,938.6566 | IDR/m³ | `=TIER_CALC!H15` | Component m³ × rate | SET |
| C16 | `MINDI_D` | Mindi tier D | 13,016,449.6566 | IDR/m³ | `=TIER_CALC!H16` | Component m³ × rate | DECISION |
| C17 | `MERANTI` | Meranti, any tier (sawn, no processing) | 20,217,982.6566 | IDR/m³ | `=TIER_CALC!C20` | Component m³ × rate | CONFIRM |
| C18 | `LAB_CARP` | Carpentry labour per m³ component (already inside tier rates; shown for Supabase) | 7,467,982.6566 | IDR/m³ | `=TIER_CALC!C8` | Reference | SET |
| C19 | `FASTENERS` | Screws, nails, dowels, glue | 1,750,614.2506 | IDR/m³ | `=INPUTS!$C$47/(TIER_CALC!C7)` | Total solid-wood component m³ per item × rate | CONFIRM |
| A20 | **PANELS — per full sheet (see PANEL_SHEETS for the 7 × 4 table)** (section row) | | | | | | |
| C21 | `PLY18_TDF` | Example: 18 mm teak double face | 1,021,346.0464 | IDR/sheet | `=PANEL_SHEETS!F19` | Sheets consumed × rate | SET |
| C22 | `PLY18_MSF` | Example: 18 mm mindi single face | 433,173.0232 | IDR/sheet | `=PANEL_SHEETS!C19` | Sheets consumed × rate | SET |
| C23 | `VENEER_M2` | Glue + tape per m² veneered (for odd panels veneered after cutting) | 10,424 | IDR/m² | `=INPUTS!$C$26` | m² veneered × rate | SET |
| A24 | **FINISHING — per m² of exposed surface** (section row) | | | | | | |
| C25 | `FIN_MAT` | Finishing materials (Zhanchen + thinner + abrasives) | 51,639.1163 | IDR/m² | `=INPUTS!$C$21/INPUTS!$C$22` | Exposed m² × rate | SET |
| C26 | `FIN_LAB` | Finishing labour incl. 65% of sanding | 128,232.1769 | IDR/m² | `=(INPUTS!$C$17+INPUTS!$C$18*INPUTS!$C$19)/INPUTS!$C$22` | Exposed m² × rate | SET |
| C27 | `FIN_ALL` | Finishing all-in (material + labour) | 179,871.2932 | IDR/m² | `=C25+C26` | Exposed m² × rate | SET |
| A28 | **PACKING — all PLV items cartoned** (section row) | | | | | | |
| C29 | `CARTON_M2` | Carton + consumables per m² of carton board (6 sides) | 42,000 | IDR/m² | `=INPUTS!$C$39` | Carton surface m² × rate, per box | SET |
| C30 | `PACK_LAB` | Packing labour per m³ of carton | 100,000 | IDR/m³ | `=INPUTS!$C$40` | Carton m³ × rate, per box | CONFIRM |
| C31 | `CARTON_GRP` | Alternative: group prices A/B/C/D (STMV bands) — see NORMS | 24k / 65k / 145k / 186k | IDR/carton | `(text)` | Only if you prefer bands to the flat m² rate | SET |
| A32 | **ALLOWANCES — % of direct cost** (section row) | | | | | | |
| C33 | `MISC_PCT` | Miscellaneous | 5.000000% (= 0.05) | % | `=INPUTS!$C$53` | × direct cost | DECISION |
| C34 | `OH_PCT` | Overhead (overhead payroll + utilities less capex) ÷ STMV direct cost | 12.992870% (= 0.1299286984895744) | % | `=(INPUTS!$C$49+INPUTS!$C$50-INPUTS!$C$51)/INPUTS!$C$52` | × (direct cost + misc) | SET |
| A35 | **MANUAL — picked per item from ops_procure.item_vendor_prices** (section row) | | | | | | |
| C36 | `HARDWARE` | Hinges, handles, slides, glass, mirror, fabric, foam, bought-in parts | case by case | IDR | `(text)` | Qty × vendor price | SET |


### C1.2 Rate card in short (per m³ of finished component)

| Tier | Meaning (29 Sep) | Yield factor | Teak IDR/m³ | Mindi IDR/m³ |
|---|---|---|---|---|
| A | Exposed, straight, length ≥ 1000 mm | 3.5 | 47,716,405.6566 | 20,414,405.6566 |
| A-CURVED | Exposed, curved or wide board, any length | 4.6 | 60,363,281.4566 | 24,483,281.4566 |
| B | Exposed, straight, length < 1000 mm (from 30 Sep also: section ≤ 40 × 40 mm up to 1500 mm) | 2.5 | 36,215,427.6566 | 16,715,427.6566 |
| C | Not exposed | 2.0 | 30,465,938.6566 | 14,865,938.6566 |
| D | Very small parts | 1.5 | 24,716,449.6566 | 13,016,449.6566 |

Meranti, any tier: 20,217,982.6566 IDR/m³. Each tier rate = (log price + processing 598,978) × yield + carpentry labour 7,467,982.6566.

Wood + processing only (tier rate minus carpentry labour), the figures quoted in the stack test: teak A 40,248,423 · A-CURVED 52,895,298.8 · B 28,747,445 · C 22,997,956 · D 17,248,467; mindi A 12,946,423 · A-CURVED 17,015,298.8 · B 9,247,445 · C 7,397,956 · D 5,548,467.

### C1.3 NORMS tab — thresholds and factors for `ops_prod.bom_norms`

A1: "NORMS — thresholds and factors for ops_prod.bom_norms (source_kind = decision unless stated)". Header row 4, data rows 5–19.

| Cell | norm_code | Norm | Value | Unit | Used by rule | Status |
|---|---|---|---|---|---|---|
| C5 | `TIER_A_MIN_LEN` | Exposed component length at or above this → tier A | 1000 | mm | T1 | DECISION |
| C6 | `TIER_D_MAX_VOL` | Component volume below this → tier D | 0.0005 | m³ | T1 (0.0005 m³ = e.g. 300 × 40 × 40 mm) | DECISION |
| C7 | `TIER_D_MAX_LEN` | …and longest dimension below this → tier D | 300 | mm | T1 (both conditions) | DECISION |
| C8 | `SHEET_L` | Plywood sheet length | 2440 | mm | P1 | SET |
| C9 | `SHEET_W` | Plywood sheet width | 1220 | mm | P1 | SET |
| C10 | `SHEET_KERF` | Saw kerf / trim allowance added to each panel dimension | 5 | mm | P1 | DECISION |
| C11 | `WASTE_REUSE_MIN` | Offcut on the last sheet counts as reusable when waste exceeds this | 25% (stored 0.25) | % | P3 | DECISION |
| C12 | `OFFCUT_HANDLING` | Handling factor on fractional sheets when offcut is reused | 5% (stored 0.05) | % | P3 | DECISION |
| C13 | `CARTON_ADD` | Added to each packed dimension for the carton | 40 | mm | K1 | SET |
| C14 | `CARTON_MIN_M2` | Below this carton area use group A price instead of flat m² rate | 0.15 | m² | K2 | CONFIRM |
| C15 | `CARTON_BAND_B` | Group bands by carton m²: A below · B from here | 1.0 | m² | K2 (only if using groups). Copy exact bands from STMV_carton_groups.xlsx Inputs B10:B12 | CONFIRM |
| C16 | `CARTON_BAND_C` | C from here | 2.5 | m² | K2 | CONFIRM |
| C17 | `CARTON_BAND_D` | D from here | 4.0 | m² | K2 | CONFIRM |
| C18 | `KD_PACK_FACTOR` | Extra consumables factor for flatpack boxes (foam, corners, hardware bag) | 0% (stored 0.0) | % | K1 — set to 0.10–0.20 if you want it; 0 = off | DECISION |
| C19 | `FIN_EXPOSED_ONLY` | Finishing m² counts exposed faces only (1) or all faces of exposed components (0) | 1 | flag | F1 — see OPEN_ITEMS 2 | DECISION |

**Norms added on 30 Sep 2026** (on the LISTS tab of the stack-test workbooks; not yet in the 29 Sep workbook):

| Cell (LISTS) | norm_code | Norm | Value | Unit | Used by rule | Status |
|---|---|---|---|---|---|---|
| F10 | `NARROW_MAX_SECTION` | Both cross-section sizes at or below this → narrow part | 40 | mm | T1 (30 Sep) | DECISION (user, 30 Sep) |
| F11 | `NARROW_MAX_LEN` | A narrow part takes tier B up to this length (inclusive) | 1500 | mm | T1 (30 Sep) | DECISION (user, 30 Sep) |

### C1.4 RULES tab — the rule spec

A1: "RULE SPEC — what the operator enters, what the system computes. This is the spec for the Apps Script and for the ops app."
A2: "Operator inputs per item: item code, finish recipe, packing sub-table (defaults to assembled L/W/H). Per component: species or panel type, name, L, W, T, qty, exposed Y/N, curved Y/N, tier override (optional)."
Header row 4, rules in rows 5–21.

| Rule | Stage | Operator input | System computes | Formula / logic (29 Sep text, verbatim) | Rates & norms used |
|---|---|---|---|---|---|
| T1 | Timber tier | species, L, W, T, qty, exposed, curved, tier override | tier | IF override → override. ELSE IF vol < TIER_D_MAX_VOL AND max(L,W,T) < TIER_D_MAX_LEN → D. ELSE IF NOT exposed → C. ELSE IF curved → A-CURVED. ELSE IF max(L,W,T) ≥ TIER_A_MIN_LEN → A. ELSE → B | TIER_A_MIN_LEN, TIER_D_MAX_VOL, TIER_D_MAX_LEN |
| T2 | Timber cost | — | component m³, cost | m³ = L×W×T/1e9 × qty. cost = m³ × rate[species, tier]. Meranti uses MERANTI whatever the tier | TEAK_*, MINDI_*, MERANTI |
| T3 | Fasteners | — | fastener cost | Σ component m³ (all species) × FASTENERS | FASTENERS |
| P1 | Panel nesting | panel type (sheet code + face), L, W, qty | pieces per sheet | Lp = L + SHEET_KERF, Wp = W + SHEET_KERF. n = MAX( INT(SHEET_L/Lp)×INT(SHEET_W/Wp), INT(SHEET_L/Wp)×INT(SHEET_W/Lp) ). If n = 0 → flag "panel larger than sheet", operator splits or joins | SHEET_L, SHEET_W, SHEET_KERF |
| P2 | Sheets needed | — | sheets (fractional), sheets (rounded up), waste % | sheets = qty / n. whole = ROUNDUP(sheets). waste = 1 − (qty × L × W) / (whole × SHEET_L × SHEET_W) | — |
| P3 | Sheets charged | — | sheets charged | IF waste > WASTE_REUSE_MIN → charge sheets × (1 + OFFCUT_HANDLING) (offcut is reusable). ELSE → charge whole sheets | WASTE_REUSE_MIN, OFFCUT_HANDLING |
| P4 | Panel cost | — | panel cost | sheets charged × sheet rate[type]. No labour line (cutting + pressing in the sheet rate) | PLY* |
| F1 | Finishing m² | exposed flag per component; finish recipe per item | finishing m² | IF FIN_EXPOSED_ONLY: Σ over exposed components of exposed-face area (default: L×W faces + edges for solid; veneered faces for panels). ELSE: Σ M2 3D of exposed components | FIN_EXPOSED_ONLY |
| F2 | Finishing cost | — | material, labour | m² × FIN_MAT + m² × FIN_LAB (recipe from finishing_recipes may override FIN_MAT for PU/duco) | FIN_MAT, FIN_LAB |
| H1 | Hardware | item code + qty from item_vendor_prices dropdown | cost | qty × vendor price; glass/mirror/fabric/foam here too | item_vendor_prices |
| K1 | Cartons | packing sub-table: box name, L, W, H, qty (default one row = assembled dims) | carton dims, m², m³ | per row: Lc = L + CARTON_ADD (same for W, H). m² = 2(LcWc + LcHc + WcHc)/1e6. m³ = LcWcHc/1e9 | CARTON_ADD |
| K2 | Packing cost | — | packing cost | per row: (m² × CARTON_M2 × (1 + KD_PACK_FACTOR if more than one box) + m³ × PACK_LAB) × qty. If m² < CARTON_MIN_M2 use group A price. Sum rows | CARTON_M2, PACK_LAB, CARTON_MIN_M2, KD_PACK_FACTOR |
| A1 | Direct cost | — | direct | timber + fasteners + panels + finishing + hardware + packing | — |
| A2 | Misc | — | misc | direct × MISC_PCT | MISC_PCT |
| A3 | Overhead | — | overhead | (direct + misc) × OH_PCT | OH_PCT |
| A4 | Unit cost | — | cost to apply | direct + misc + overhead → existing COST TO APPLY / USD / markup columns unchanged | — |
| S1 | Snapshot | — | — | On submit, every line stores the rate value used and rates_version (date). Later rate changes never re-cost an issued BOM | — |

### C1.5 Rule revisions of 30 Sep 2026 (current state)

These changes were made in the stack-test workbooks. The 29 Sep Rule Spec workbook and Input Template v2 **have not been reissued** with them.

**T1, revised.** Order of tests for a solid-wood component (first match wins):

1. Tier override filled → use the override.
2. Volume of one piece < `TIER_D_MAX_VOL` (0.0005 m³) AND longest side < `TIER_D_MAX_LEN` (300 mm) → **D**.
3. Not exposed → **C**.
4. Curved = Y → **A-CURVED**.
5. Middle dimension ≤ `NARROW_MAX_SECTION` (40 mm) AND longest side ≤ `NARROW_MAX_LEN` (1500 mm) → **B**. (The middle of the three dimensions is the larger of the two cross-section sizes, so both cross-section sizes must be 40 mm or less, whichever column the operator typed them in.)
6. Longest side ≥ `TIER_A_MIN_LEN` (1000 mm) → **A**.
7. Otherwise → **B**.

Sheet formula for row r (AUTO TIER, column N; L = D, W = E, T = F, exposed = H, curved = I, override = J; norms on LISTS!F3:F11):

```
=IF(D{r}="","",IF(J{r}<>"",J{r},IF(AND(D{r}*E{r}*F{r}/1000000000<LISTS!$F$4,MAX(D{r},E{r},F{r})<LISTS!$F$5),"D",IF(H{r}="N","C",IF(I{r}="Y","A-CURVED",IF(AND(MEDIAN(D{r},E{r},F{r})<=LISTS!$F$10,MAX(D{r},E{r},F{r})<=LISTS!$F$11),"B",IF(MAX(D{r},E{r},F{r})>=LISTS!$F$3,"A","B")))))))
```

History of this rule on 30 Sep: first proposal by Claude, a strip test (thickness ≤ 20 mm and width ≤ 40 mm → tier D), not adopted. First instruction by the user: under 40 mm wide → B unless over 1.5 m long (implemented as MEDIAN < 40). Corrected by the user to a 40 × 40 section, inclusive (MEDIAN ≤ 40). Effect on the two test items: OV-505 B 760,154 → 725,983; ID-OV-506 861,256 → 766,148.

**F2, revised.** Finishing is costed and shown as four lines, each = finishing m² × its rate: FINISHING MATERIALS (`FIN_MAT`, Zhanchen + thinner), SANDING MATERIALS (`SAND_MAT`, abrasives), SANDING LABOUR (`SAND_LAB`, 65% of the sanding pool), FINISHING LABOUR (`FIN_LAB`, finishing pool). The four rates add up to the same 179,871.2932 per m² as the 29 Sep card (51,639.1163 material + 128,232.1769 labour). The item summary has 18 lines instead of 15.

**F1 as implemented in the template and the stack test.** Finishing m² = Σ over solid components with EXPOSED = Y of L × W × qty (one face, the largest), plus Σ over panels of L × W × qty × exposed faces (1 or 2). This is narrower than the F1 text ("L×W faces + edges"). See OPEN_ITEMS 2 and C4 table 4.

**P-rules, addition.** A "SHEETS (manual)" column was added on the panel lines for panels given as a sheet count with no size (round, oversize, laminated). The exact column position and formula of that addition are **NOT IN PROJECT CONTEXT** (they are in the 12-item workbook, whose item tabs could not be read for this export).

**RATES tab of the stack-test workbooks (rates_version 2026-09-29, finishing split 30 Sep).** A1: 'RATES — snapshot of "PLV BOM Rate Card and Rule Spec 29Sep26" (rates_version 2026-09-29), finishing split into four rates 30 Sep'. A2: "Blue = base figure from the rate card INPUTS / NORMS tabs (change it and every cost in this workbook follows). Black = formula. Item tabs look rates up by the code in column A." Header row 4 (code, Description, Value, Unit, Source). Layout as in the two-item workbook v2; the 12-item workbook's RATES tab is longer (used range A1:E65, it also carries raw board prices for the panel lines) and its extra rows are **NOT IN PROJECT CONTEXT**.

| Cell | code | Description | Value (calculated, not rounded) | Unit | Formula (as in the sheet) | Source |
|---|---|---|---|---|---|---|
| A5 | **BASE FIGURES (rate card INPUTS / TIER_CALC)** (section row) | | | | | |
| C6 | `log_teak` | Teak log price, implied | 10,900,000 | IDR/m³ |  | Ledger 152.3m ÷ 14 m³. Status CONFIRM — replace with nota price |
| C7 | `log_mindi` | Mindi log price, implied | 3,100,000 | IDR/m³ |  | Ledger 126.1m ÷ 41 m³. Status CONFIRM |
| C8 | `meranti_sawn` | Meranti dry sawn timber | 8,500,000 | IDR/m³ |  | STMV BOM price. Status CONFIRM |
| C9 | `processing` | Wood processing (kiln + sawmill + hauling + sawmill staff), per m³ of log | 598,978 | IDR/m³ |  | Ledger ÷ 75.82 m³ teak + mindi |
| C10 | `carp_pool` | Carpentry payroll pool Mar–Sep 2026 | 270,175,017 | IDR |  | Payroll categorised by name, 29 Sep |
| C11 | `carp_deduct` | Less panel cutting / pressing (already in panel rate) | 10.000000% (= 0.1) | % |  | Decision 29 Sep |
| C12 | `comp_m3` | STMV solid wood in components (teak 12.21 + mindi 13.15 + meranti 7.20) | 32.5600 | m³ |  | REVISI BOM 21 MEI 26 |
| C13 | `yield_A` | Yield factor tier A (exposed, straight, ≥ 1000 mm) | 3.5000 | x |  | Judgement — OPEN_ITEMS 4 |
| C14 | `yield_AC` | Yield factor tier A-CURVED / wide board | 4.6000 | x |  | STMV mindi |
| C15 | `yield_B` | Yield factor tier B (exposed < 1000 mm, or section ≤ 40 × 40 up to 1500 mm) | 2.5000 | x |  | Judgement — OPEN_ITEMS 4 |
| C16 | `yield_C` | Yield factor tier C (not exposed) | 2.0 | x |  | STMV teak |
| C17 | `yield_D` | Yield factor tier D (very small parts) | 1.5000 | x |  | Judgement — OPEN_ITEMS 4 |
| C18 | `yield_MER` | Meranti sawn-to-component yield | 1.5000 | x |  | Assumption |
| C19 | `fast_total` | Screws, nails, dowels, wood glue — STMV ledger estimate | 57,000,000 | IDR |  | Status CONFIRM — OPEN_ITEMS 7 |
| C20 | `paint_total` | Finishing materials: Zhanchen all-in 52,888,326 + thinner 31,249,000 | 84,137,326 | IDR |  | Ledger, agreed 28 Sep |
| C21 | `abrasive_total` | Sanding materials: abrasives / sandpaper | 27,713,000 | IDR |  | Ledger, agreed 28 Sep |
| C22 | `fin_pool` | Finishing payroll pool excl. sanding (finishing, PU, gerinda, helper) | 192,243,271 | IDR |  | Payroll, 29 Sep |
| C23 | `sand_pool` | Sanding payroll pool, as paid | 131,550,191 | IDR |  | Payroll, 29 Sep |
| C24 | `sand_keep` | Sanding share kept (35% removed: bleach re-sanding, packing work) | 65.000000% (= 0.65) | % |  | Decision 29 Sep |
| C25 | `fin_m2` | STMV finishing surface | 2,166 | m² |  | Items tab estimate |
| C26 | `oh_pool` | Overhead payroll 213,627,079 + utilities 144,633,030 − PLN upgrade 49,700,000 | 308,560,109 | IDR |  | Payroll + reconciliation 23 Sep |
| C27 | `stmv_direct` | STMV direct cost | 2,374,841,837 | IDR |  | Reconciliation 23 Sep, section A |
| A28 | **RATE CARD — applied by the item tabs** (section row) | | | | | |
| C29 | `LAB_CARP` | Carpentry labour per m³ of component (inside every tier rate) | 7,467,982.6566 | IDR/m³ | `=$C$10*(1-$C$11)/$C$12` | Rate card TIER_CALC C8 |
| C30 | `TEAK_A` | Teak tier A | 47,714,405.6566 | IDR/m³ | `=($C$6+$C$9)*$C$13+$C$29` | (log + processing) × yield + labour |
| C31 | `TEAK_AC` | Teak tier A-CURVED | 60,363,281.4566 | IDR/m³ | `=($C$6+$C$9)*$C$14+$C$29` |  |
| C32 | `TEAK_B` | Teak tier B | 36,215,427.6566 | IDR/m³ | `=($C$6+$C$9)*$C$15+$C$29` |  |
| C33 | `TEAK_C` | Teak tier C | 30,465,938.6566 | IDR/m³ | `=($C$6+$C$9)*$C$16+$C$29` |  |
| C34 | `TEAK_D` | Teak tier D | 24,716,449.6566 | IDR/m³ | `=($C$6+$C$9)*$C$17+$C$29` |  |
| C35 | `MINDI_A` | Mindi tier A | 20,414,405.6566 | IDR/m³ | `=($C$7+$C$9)*$C$13+$C$29` |  |
| C36 | `MINDI_AC` | Mindi tier A-CURVED | 24,483,281.4566 | IDR/m³ | `=($C$7+$C$9)*$C$14+$C$29` |  |
| C37 | `MINDI_B` | Mindi tier B | 16,715,427.6566 | IDR/m³ | `=($C$7+$C$9)*$C$15+$C$29` |  |
| C38 | `MINDI_C` | Mindi tier C | 14,865,938.6566 | IDR/m³ | `=($C$7+$C$9)*$C$16+$C$29` |  |
| C39 | `MINDI_D` | Mindi tier D | 13,016,449.6566 | IDR/m³ | `=($C$7+$C$9)*$C$17+$C$29` |  |
| C40 | `MERANTI` | Meranti, any tier | 20,217,982.6566 | IDR/m³ | `=$C$8*$C$18+$C$29` | Sawn price × yield + labour, no processing |
| C41 | `FASTENERS` | Screws, nails, dowels, glue per m³ of component | 1,750,614.2506 | IDR/m³ | `=$C$19/$C$12` | Rule T3 |
| C42 | `FIN_MAT` | Finishing materials (Zhanchen + thinner) per m² exposed | 38,844.5642 | IDR/m² | `=$C$20/$C$25` | Rule F2. With SAND_MAT = the 29 Sep card FIN_MAT (51,639) |
| C43 | `SAND_MAT` | Sanding materials (abrasives) per m² exposed | 12,794.5522 | IDR/m² | `=$C$21/$C$25` | Rule F2 |
| C44 | `SAND_LAB` | Sanding labour (65% of sanding pool) per m² exposed | 39,477.2041 | IDR/m² | `=$C$23*$C$24/$C$25` | Rule F2. With FIN_LAB = the 29 Sep card FIN_LAB (128,232) |
| C45 | `FIN_LAB` | Finishing labour (finishing pool) per m² exposed | 88,754.9728 | IDR/m² | `=$C$22/$C$25` | Rule F2 |
| C46 | `FIN_ALL` | Finishing all-in, four rates above | 179,871.2932 | IDR/m² | `=$C$42+$C$43+$C$44+$C$45` | Unchanged from the 29 Sep card: 179,871 |
| C47 | `CARTON_M2` | Carton + consumables per m² of carton board (6 sides) | 42,000 | IDR/m² |  | Rule K2 |
| C48 | `PACK_LAB` | Packing labour per m³ of carton | 100,000 | IDR/m³ |  | Rule K2. Status CONFIRM |
| C49 | `GRP_A` | Carton group A price (boxes under CARTON_MIN_M2) | 24,000 | IDR |  | Rule K2 |
| C50 | `MISC_PCT` | Miscellaneous, × direct cost | 5.000000% (= 0.05) | % |  | Decision 29 Sep |
| C51 | `OH_PCT` | Overhead, × (direct + misc) | 12.992870% (= 0.1299286984895744) | % | `=$C$26/$C$27` | OPEN_ITEMS 8 |
| A52 | **NORMS not on the LISTS tab** (section row) | | | | | |
| C53 | `CARTON_MIN_M2` | Below this carton area use group A price | 0.1500 | m² |  | NORMS |
| C54 | `KD_PACK_FACTOR` | Extra consumables factor for flatpack (2+ boxes) | 0.000000% (= 0.0) | % |  | NORMS — 0 = off |
| C55 | `USD_IDR` | Exchange rate implied by the old BOM (unit IDR ÷ unit USD) | 16,000 | IDR/USD |  | REVISI BOM 21 MEI 26 |


### C1.6 OPEN_ITEMS — full list with current defaults

A1: "OPEN ITEMS — to close before the rates are frozen (Day 1 sign-off)". Header row 3 (#, Item, Who, Effect if unresolved), items in rows 4–13. The "Item", "Who" and "Effect" columns are verbatim. The last two columns are added for this export.

| # | Item (verbatim) | Who | Effect if unresolved | Default in force now | State on 30 Sep 2026 |
|---|---|---|---|---|---|
| 1 | LABOUR BASIS FIXED IN THIS SHEET: the 2,917,000/m³ carpentry rate agreed 29 Sep divided the pool by rough-sawn m³ (83.36). The tier rates are per m³ of component, so labour must be divided by component m³ (32.56) → 7,468,000/m³. Using 2,917,000 in the BOM would understate carpentry labour by about 2.5×. Please confirm the component basis. | User | All timber tier rates | Component basis: 270,175,017 × 0.9 ÷ 32.56 = 7,467,982.6566 IDR/m³, inside every tier rate | Open. No confirmation recorded. The stack test used the component basis. |
| 2 | Finishing m² basis: the 2,166 m² STMV denominator was an item-level surface estimate, not the sum of component 6-face areas. BOM rule F1 should therefore count exposed faces only. Calibrate on Day 3 by re-costing PL 085/086 both ways. | Claude Day 3 | Finishing cost ±30% | `FIN_EXPOSED_ONLY` = 1; template counts one face (L × W) per exposed component | Open. The stack test calls it "the largest open question in the stack"; all-faces costing lifts the unit cost by +6.0% to +37.3% over the one-face estimate (C4.4). Ruling asked of the user, not given. |
| 3 | Teak and mindi log price per m³ and total m³ bought: replace the implied ledger prices with nota figures. Also confirms the C-tier yield (2.0) and the A-curved yield (4.6). | User (nota copies) | Tier rates ±10–15% | Teak log 10,900,000; mindi log 3,100,000; yields C 2.0, A-CURVED 4.6 | Open. The 30 Sep teak beam nota (about 7.12–7.31M per m³, file urat_jati_30sep.xlsx) has not been applied. |
| 4 | Tier A straight (≥1 m) yield 3.5, B 2.5, D 1.5: judgement values, no STMV evidence for A. Adjust by experience. | User | TEAK_A is the biggest PLV cost line (beds, tables, loungers) | A 3.5, B 2.5, D 1.5 | Open. |
| 5 | Meranti: sawn price 8.5 jt (BOM) and yield 1.5 (assumption) — confirm from nota if PLV uses meranti. | User | Meranti items only | 8,500,000 IDR/m³ sawn, yield 1.5 | Open. |
| 6 | Carton group band limits (NORMS CARTON_BAND_*) are estimates; exact values are in STMV_carton_groups.xlsx Inputs B10:B12 if you want bands instead of the flat 42,000/m². Recommendation: use the flat rate, keep group A price for very small boxes. | User | Small | Flat 42,000 IDR/m² of carton board; group A price 24,000 for boxes under 0.15 m²; bands B 1.0, C 2.5, D 4.0 m² unused | Open. The stack test used the flat rate. |
| 7 | Fasteners 57m estimate from the hardware ledger line — confirm or drop into misc. | User | ~1.75 jt per m³ component | 57,000,000 ÷ 32.56 = 1,750,614.2506 IDR/m³, as its own line | Open. |
| 8 | Overhead 13%: pool = overhead payroll + electricity/utilities − PLN upgrade, ÷ STMV direct cost from the reconciliation. If the denominator should be the rate-built direct cost (labour at 520.9m not 605.8m) the % rises to ~14%. | User | Every item, ±1% | 308,560,109 ÷ 2,374,841,837 = 12.99287% | Open. |
| 9 | Veneer prices (110k / 20k per metre), 2.5 m per face, 57,143 labour per face: user figures, not ledger. Mindi veneer width ≥ 1.22 m to confirm. | User | Panel rates | Teak veneer 110,000 per running metre; mindi 20,000; 2.5 m per face; 57,142.86 labour per face | Open. |
| 10 | Not in any rate (folded into misc/overhead or quoted at project level): finishing sundries 14.4m (Marguard, preservative, dempul, brushes), KSA/Sayerlac, bleach, stainless screws, subcontracted CNC/lathe, export freight, SVLK, installation. | — | Project-level lines on the PLV quote | Excluded from all rates | Standing rule, not a question. |

Items 1, 4 and 8 were named as the ones that move the numbers materially. Questions raised after 29 Sep are in D3.

### C1.7 Cross-checks recorded with the rate card

- "Check against the 27 Sep sketch (materials only): A 34jt · B 28jt · C 25jt · D 23jt. All-in rates above land at roughly A 48 · B 36 · C 30 · D 25 jt because labour is now inside the rate."
- With labour inside, D lands at 24.7 jt, close to the 27 Sep sketch of 23 jt without any special multiplier.
- Production labour charged into rates: 520.9m of 594.0m paid to the production pools (carpentry 270,175,017 × 0.9 = 243,157,515.3; finishing 192,243,271; sanding 131,550,191 × 0.65 = 85,507,624.15).

### C1.8 Labour rate card by worker category [DRIVE]

Google Sheet "PLV Labour Rate Card - Daily Worker Payroll Mar-Sep 2026" (file id 1fqcnkjfH1fO98VPN0lVfiSCsUo_YQY9k-YZK2NA1UjI, created 29 Sep 2026). This is an hourly rate card per category, built before the per-m³ / per-m² labour method was chosen. It is not used by rules T1–A4. Header text verbatim:

- "LABOUR RATE CARD - PT Tala Home daily workers"
- "Source: 30 weekly payroll sheets 2 Mar - 25 Sep 2026. Rate window = 29 Jun - 25 Sep 2026 (13 weeks, current wage rates). All IDR."
- "Indirect uplift (driver+security+helper cost / production cost) = 0.0995"
- "Method: base_rate_per_day = base_pay / man_days. loaded_rate_per_hr = total_cost / (regular_hrs + ot_hrs + weekend_hrs). bom_rate = loaded_rate_per_hr x (1 + indirect uplift), rounded to 100."

| category | workers | man_days | regular_hrs | ot_hrs | weekend_hrs | total_hrs | base_pay | ot_pay | weekend_pay | incentive_allowance | total_cost | base_rate_per_day | base_rate_per_hr | loaded_rate_per_hr | loaded_rate_per_8h_day | load_multiplier | ot_pct_of_regular | weekend_pct_of_regular | bom_rate_per_hr_incl_indirect |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SAMPLE MAKER | 2 | 115.8 | 926 | 222 | 168 | 1316.2 | 18008875 | 6474846 | 6612000 | 192500 | 31288221 | 155542 | 19443 | 23771 | 190166 | 1.223 | 0.24 | 0.181 | 26100 |
| TUKANG | 7 | 370.5 | 2964 | 612.5 | 528 | 4104.5 | 43485000 | 13621570 | 15630000 | 3280000 | 75786708 | 117368 | 14671 | 18464 | 147714 | 1.259 | 0.207 | 0.178 | 20300 |
| SANDING | 20 | 627.9 | 5023 | 1180.2 | 1144 | 7347.1 | 44213990 | 15508176 | 20155740 | 3005000 | 82877938 | 70418 | 8802 | 11280 | 90242 | 1.282 | 0.235 | 0.228 | 12400 |
| FINISHING | 3 | 105.5 | 844 | 217 | 188 | 1249 | 12037250 | 4654035 | 5459000 | 1217500 | 23367785 | 114097 | 14262 | 18709 | 149674 | 1.312 | 0.257 | 0.223 | 20600 |
| PU | 11 | 432.1 | 3457 | 712 | 676 | 4845.2 | 32980935 | 10256116 | 12935000 | 1647500 | 57819551 | 76319 | 9540 | 11933 | 95468 | 1.251 | 0.206 | 0.196 | 13100 |
| GERINDA | 4 | 129.5 | 1036 | 197 | 236 | 1469 | 10360000 | 2957500 | 4720000 | 0 | 18022430 | 80000 | 10000 | 12269 | 98148 | 1.227 | 0.19 | 0.228 | 13500 |
| FITTING (1 week only) | 1 | 3.9 | 31 | 7 | 0 | 38 | 387500 | 131250 | 0 | 0 | 518750 | 100000 | 12500 | 13651 | 109211 | 1.092 | 0.226 | 0 | 15000 |
| DRIVER | 1 | 62 | 496 | 17.2 | 83 | 595.8 | 7638400 | 419727 | 2553739 | 310000 | 10921866 | 123200 | 15400 | 18332 | 146655 | 1.19 | 0.035 | 0.167 | |
| SECURITY | 3 | 152 | 1216 | 0 | 80 | 1296 | 7916695 | 0 | 1041670 | 0 | 8958365 | 52084 | 6510 | 6912 | 55299 | 1.062 | 0 | 0.066 | |
| HELPER | 1 | 74 | 592 | 7.5 | 0 | 599.5 | 5943280 | 121275 | 0 | 2890000 | 8954555 | 80315 | 10039 | 14937 | 119494 | 1.488 | 0.013 | 0 | |

Below this table the sheet holds a "WEEKLY RECAP (all 30 weeks) - cost and hours per category" block (columns week, period, category, headcount, man_days, regular_hrs, ot_hrs, weekend_hrs, base_pay, total_cost, loaded_rate_per_hr; weeks 1 to 29 as numbered in the sheet, with numbers 13 to 16 absent). Those weekly rows were retrieved but are not transcribed here: **NOT IN THIS EXPORT** (open the sheet for them).

---

## C2. Input Template v2 [REBUILT]

File `PLV_BOM_Input_Template_v2.xlsx`, 29 Sep 2026. Tabs in order: `README`, `TEMPLATE`, `PL 085` (filled example), `PL 0XX flatpack` (two-carton example), `LISTS`. One item = one tab; every item tab has identical fixed rows so a script can read any tab by position.

Cell colours: white = operator types · grey = calculated preview · blue = filled by the system later (rates, costs, summary) · yellow = example data.

Column widths A to S: 5, 13, 30, 9, 9, 9, 7, 9, 9, 10, 26, 11, 11, 11, 10, 9, 26, 14, 14.

### C2.1 README tab, verbatim

1. PLV BOM INPUT TEMPLATE — v2 (one tab per item), 29 Sep 2026
2. One item = one tab. Duplicate the TEMPLATE tab, rename it to the item code (e.g. PL 085), fill the header block, then one line per component. Never move rows or columns: the system reads fixed positions.
3. HEADER (rows 1–7) / KEPALA
4. Item code, name, area, project qty, finish recipe, flatpack Y/N, notes · overall L × W × H (mm) · drawing / spec / photo links · revision. The image box shows the photo link automatically in Google Sheets.
5. PACKING (rows 10–15) / PACKING
6. Assembled item: leave the 4 box rows blank — the system makes one carton from the overall size + 40 mm each side. Flatpack (2+ cartons): one row per box: contents, packed L × W × H, how many of that box. Carton size, m² and m³ are calculated; TOTAL row is what the costing uses.
7. SOLID WOOD (rows 18–42) / KAYU SOLID
8. Species (dropdown), component name, L × W × T in mm, QTY per ONE item, EXPOSED Y (visible, gets finish) / N (hidden), CURVED Y for curved or wide-board parts. AUTO TIER shows A / A-CURVED / B / C / D; only fill TIER OVERRIDE if you disagree.
9. PANELS (rows 46–60) / PANEL
10. Panel type (dropdown, e.g. PLY-18-TDF = 18 mm teak veneer both faces), L × W, T = board thickness, qty, EXPOSED FACES 1 or 2. Preview shows pieces per sheet, sheets needed, waste %.
11. HARDWARE (rows 63–77) / HARDWARE
12. One line per bought-in part. Item master code (I-xxxxx) and price only if known.
13. RULES / ATURAN
14. • mm everywhere; qty per ONE item · white = type, grey = calculated preview, blue = filled by the system later (rates, costs, summary) · yellow = example · need more lines? use a second tab "PL 085 (2)" rather than inserting rows.
15. • Check column must read OK on every filled line before the tab is submitted.

### C2.2 LISTS tab

A1: "Dropdown lists and thresholds. Do not rename or move." Header row 2; values from row 3.

| Column | Header | Values (row 3 downward) |
|---|---|---|
| A | SOLID_SPECIES | TEAK, MINDI, MERANTI, OTHER |
| B | PANEL_TYPE | 35 codes `PLY-<t>-<face>` for t = 3, 6, 9, 12, 15, 18, 24 and face = RAW, MSF, MDF, TSF, TDF, in that order: PLY-3-RAW, PLY-3-MSF, PLY-3-MDF, PLY-3-TSF, PLY-3-TDF, PLY-6-RAW, … PLY-24-TDF (rows 3–37) |
| C | FINISH_RECIPE | NC NATURAL, PU DUCO, NC + GLAZE, NONE (RAW), OTHER |
| D | YN | Y, N |
| E / F | NORM / VALUE | F3 TIER_A_MIN_LEN mm = 1000 · F4 TIER_D_MAX_VOL m3 = 0.0005 · F5 TIER_D_MAX_LEN mm = 300 · F6 SHEET_L mm = 2440 · F7 SHEET_W mm = 1220 · F8 SHEET_KERF mm = 5 · F9 CARTON_ADD mm = 40 · (added 30 Sep in the stack-test workbooks: F10 NARROW_MAX_SECTION mm = 40 · F11 NARROW_MAX_LEN mm = 1500) |

E11 (29 Sep file): "Panel type: PLY-<thickness>-<face>. RAW no veneer · MSF/MDF mindi veneer 1/2 faces · TSF/TDF teak veneer 1/2 faces".

### C2.3 Header block (rows 1–8)

| Row | Label in A:B (merged) | Input cell | Label in D:F (merged) | Input cell (G:K merged) |
|---|---|---|---|---|
| 1 | ITEM CODE | C1 | OVERALL L mm | G1 |
| 2 | ITEM NAME | C2 | OVERALL W mm | G2 |
| 3 | AREA / ROOM | C3 | OVERALL H mm | G3 |
| 4 | PROJECT QTY | C4 | DRAWING LINK | G4 |
| 5 | FINISH RECIPE | C5 (dropdown `=LISTS!$C$3:$C$7`) | SPEC LINK | G5 |
| 6 | FLATPACK? (Y/N) | C6 (dropdown `=LISTS!$D$3:$D$4`) | PHOTO LINK | G6 |
| 7 | NOTES | C7 | REVISION / DATE | G7 |
| 8 | (spacer row, height 6) | | | |

Image box: merged `L1:S8`, formula `=IF(G6="","photo",IMAGE(G6))` (evaluated by Google Sheets only).

### C2.4 Packing block (rows 9–15)

Row 9 title: "PACKING — assembled: leave boxes blank (system uses overall size as 1 carton). Flatpack: one row per box."
Row 10 header: A BOX · B:C CONTENTS (merged) · D L mm · E W mm · F H mm · G QTY · H CARTON L · I CARTON W · J CARTON H · K (blank) · L m² 6 sides (calc) · M m³ (calc).
Rows 11–14: four box rows (A = 1 to 4). Row 15: TOTAL.

| Column | Kind | Content / formula (row r = 11 to 14) |
|---|---|---|
| A | fixed | Box number 1–4 |
| B:C | input | Contents |
| D, E, F | input | Packed L, W, H in mm |
| G | input | Qty of that box (blank counts as 1) |
| H | calc | `=IF(D{r}="","",D{r}+LISTS!$F$9)` |
| I | calc | `=IF(E{r}="","",E{r}+LISTS!$F$9)` |
| J | calc | `=IF(F{r}="","",F{r}+LISTS!$F$9)` |
| L | calc | `=IF(H{r}="","",2*(H{r}*I{r}+H{r}*J{r}+I{r}*J{r})/1000000*IF(G{r}="",1,G{r}))` |
| M | calc | `=IF(H{r}="","",H{r}*I{r}*J{r}/1000000000*IF(G{r}="",1,G{r}))` |

TOTAL row 15:

| Cell | Meaning | Formula |
|---|---|---|
| A15 | label | TOTAL |
| G15 | cartons per item | `=IF(D11="",1,SUMPRODUCT((D11:D14<>"")*IF(G11:G14="",1,G11:G14)))` |
| H15 | label | cartons |
| L15 | carton board m² | `=IF(D11="",IF(G1="","",2*((G1+LISTS!$F$9)*(G2+LISTS!$F$9)+(G1+LISTS!$F$9)*(G3+LISTS!$F$9)+(G2+LISTS!$F$9)*(G3+LISTS!$F$9))/1000000),SUM(L11:L14))` |
| M15 | carton m³ | `=IF(D11="",IF(G1="","",(G1+LISTS!$F$9)*(G2+LISTS!$F$9)*(G3+LISTS!$F$9)/1000000000),SUM(M11:M14))` |

If the first box row is blank, the total falls back to one carton made from the overall size plus 40 mm on each dimension.

### C2.5 Solid wood block (title row 16, header row 17, 25 lines in rows 18–42)

Row 16 title: "SOLID WOOD — one line per component, mm, qty per ONE item".

| Column | Header | Kind | Content / formula (row r = 18 to 42) |
|---|---|---|---|
| A | NO | fixed | 1–25 |
| B | MATERIAL | input | dropdown `=LISTS!$A$3:$A$6` (TEAK / MINDI / MERANTI / OTHER) |
| C | COMPONENT | input | name |
| D | L mm | input | longest dimension |
| E | W mm | input | |
| F | T mm | input | |
| G | QTY | input | per one item (blank counts as 1 in the calculations) |
| H | EXPOSED Y/N | input | dropdown `=LISTS!$D$3:$D$4` |
| I | CURVED Y/N | input | dropdown `=LISTS!$D$3:$D$4` |
| J | TIER OVERRIDE | input | dropdown list "A,A-CURVED,B,C,D"; normally blank |
| K | NOTE | input | |
| L | VOL m³ (calc) | calc | `=IF(OR(D{r}="",E{r}="",F{r}=""),"",D{r}*E{r}*F{r}/1000000000*IF(G{r}="",1,G{r}))` |
| M | FACE m² (calc) | calc | `=IF(OR(D{r}="",E{r}=""),"",D{r}*E{r}/1000000*IF(G{r}="",1,G{r}))` |
| N | AUTO TIER (calc) | calc | 29 Sep: `=IF(D{r}="","",IF(J{r}<>"",J{r},IF(AND(D{r}*E{r}*F{r}/1000000000<LISTS!$F$4,MAX(D{r},E{r},F{r})<LISTS!$F$5),"D",IF(H{r}="N","C",IF(I{r}="Y","A-CURVED",IF(MAX(D{r},E{r},F{r})>=LISTS!$F$3,"A","B"))))))` · 30 Sep version: see C1.5 |
| O, P | (blank) | | |
| Q | CHECK (calc) | calc | `=IF(D{r}="","",IF(B{r}="","material?",IF(H{r}="","exposed Y/N?",IF(G{r}="","qty?","OK"))))` |
| R | RATE (system) | system | blank in the template. In the stack-test workbooks: `=IF(N{r}="","",IF(B{r}="MERANTI",RATES!$C$<MERANTI row>,IFERROR(INDEX(RATES!$C:$C,MATCH(B{r}&"_"&SUBSTITUTE(N{r},"-CURVED","C"),RATES!$A:$A,0)),"rate?")))` |
| S | COST IDR (system) | system | blank in the template. In the stack-test workbooks: `=IF(ISNUMBER(R{r}),L{r}*R{r},"")` |

Validation messages in the solid block: `material?` · `exposed Y/N?` · `qty?` · `OK`. Rate lookup failure shows `rate?`.

### C2.6 Panel block (title row 44, header row 45, 15 lines in rows 46–60)

Row positions follow the build-script constants: panel title row 44, header row 45, lines 46–60; hardware title row 62, header row 63, lines 64–78; summary title row 81, lines from row 82. The stack-test check output reads hardware in rows 64–66 and the unit cost in D96, which agrees. The README text quotes the hardware block as "rows 63–77" and the hand-over message says the summary starts at "row 79"; the conversation summary lists "R_PAN_H=46, R_HW_H=63, R_SUM=79". Those labels are one or two rows off from the script. Verify against the actual file before coding fixed positions.

Row 44 title: "PANELS — one line per panel, L × W in mm, T = board thickness, qty per item".

| Column | Header | Kind | Content / formula (row r = 46 to 60) |
|---|---|---|---|
| A | NO | fixed | 1–15 |
| B | PANEL TYPE | input | dropdown `=LISTS!$B$3:$B$37` |
| C | COMPONENT | input | name |
| D | L mm | input | |
| E | W mm | input | |
| F | T mm | input | board thickness, must match the panel type |
| G | QTY | input | per one item |
| H | EXPOSED FACES (1/2) | input | dropdown list "1,2" (0 was typed for raw backing boards in the stack test) |
| I, J | (blank) | | |
| K | NOTE | input | |
| L | VOL m³ (calc) | calc | same formula as the solid block |
| M | FACE m² (calc) | calc | `=IF(OR(D{r}="",E{r}=""),"",D{r}*E{r}/1000000*IF(G{r}="",1,G{r}))` |
| N | PIECES/SHEET (calc) | calc | `=IF(OR(D{r}="",E{r}=""),"",MAX(INT(LISTS!$F$6/(D{r}+LISTS!$F$8))*INT(LISTS!$F$7/(E{r}+LISTS!$F$8)),INT(LISTS!$F$6/(E{r}+LISTS!$F$8))*INT(LISTS!$F$7/(D{r}+LISTS!$F$8))))` |
| O | SHEETS (calc) | calc | `=IF(OR(N{r}="",N{r}=0),"",IF(G{r}="",1,G{r})/N{r})` |
| P | WASTE % (calc) | calc | `=IF(O{r}="","",1-(IF(G{r}="",1,G{r})*D{r}*E{r})/(ROUNDUP(O{r},0)*LISTS!$F$6*LISTS!$F$7))` |
| Q | CHECK (calc) | calc | `=IF(D{r}="","",IF(B{r}="","panel type?",IF(N{r}=0,"panel bigger than sheet",IF(IFERROR(VALUE(MID(B{r},5,FIND("-",B{r},5)-5)),0)<>F{r},"T must match panel type",IF(H{r}="","exposed faces?","OK")))))` |
| R | RATE (system) | system | blank in the template (sheet price by panel type) |
| S | COST IDR (system) | system | blank in the template (sheets charged × sheet price, rules P3–P4) |

Validation messages in the panel block: `panel type?` · `panel bigger than sheet` · `T must match panel type` · `exposed faces?` · `OK`.

Rule P3 (charge whole sheets, or fractional sheets × 1.05 when waste exceeds 25%) is in the rule spec but has no formula in the 29 Sep template; the panel cost formulas of the 12-item workbook are **NOT IN PROJECT CONTEXT**.

### C2.7 Hardware block (title row 62, header row 63, 15 lines in rows 64–78)

Row 62 title: "HARDWARE & BOUGHT-IN — hinges, slides, handles, glass, mirror, fabric, foam, lighting. Price only if known."

| Column | Header | Kind | Content / formula (row r = 64 to 78) |
|---|---|---|---|
| A | NO | fixed | 1–15 |
| B | ITEM MASTER CODE | input | `I-xxxxx` if known |
| C | DESCRIPTION | input | |
| D:F (merged) | VENDOR | input | |
| G | QTY | input | per one item |
| H | UOM | input | |
| K:Q (merged) | LINK / NOTE | input | |
| R | UNIT PRICE IDR (if known) | input | |
| S | LINE TOTAL (calc) | calc | `=IF(OR(G{r}="",R{r}=""),"",G{r}*R{r})` |

No validation message in this block; a line without quantity or price shows a blank total.

### C2.8 Summary block (title row 81, lines from row 82)

Title, 29 Sep template: "SUMMARY (filled by the system on Day 3 — do not type here)". Labels in column C, values in column D. F82: "preview only; costs come from the rate card".

| Row | Label | 29 Sep template | Formula as implemented in the stack-test workbook of 30 Sep (15-line version) |
|---|---|---|---|
| 82 | Solid wood m³ | `=SUM(L18:L42)` | same |
| 83 | Panel sheets | `=SUM(O46:O60)` | same |
| 84 | Finishing m² (exposed) | `=SUMIF(H18:H42,"Y",M18:M42)+SUMPRODUCT(M46:M60,H46:H60)` | same |
| 85 | Cartons | `=G15` | same |
| 86 | Carton m³ | `=M15` | same |
| 87 | TIMBER | system (blank) | `=SUM(S18:S42)` — note: "Σ component m³ × tier rate (yield, processing and carpentry labour inside)" |
| 88 | FASTENERS | system (blank) | `=D82*RATES!$C$<FASTENERS>` — "solid wood m³ × FASTENERS" |
| 89 | PANELS | system (blank) | `=SUM(S46:S60)` |
| 90 | FINISHING | system (blank) | `=D84*(RATES!$C$<FIN_MAT>+RATES!$C$<FIN_LAB>)` — "exposed face m² × (FIN_MAT + FIN_LAB)" |
| 91 | HARDWARE | `=SUM(S64:S78)` | same — "manual lines, old BOM prices" |
| 92 | PACKING | system (blank) | `=IF(L15<RATES!$C$<CARTON_MIN_M2>,RATES!$C$<GRP_A>*G15,L15*RATES!$C$<CARTON_M2>*(1+IF(G15>1,RATES!$C$<KD_PACK_FACTOR>,0)))+M15*RATES!$C$<PACK_LAB>` — "carton m² × CARTON_M2 + carton m³ × PACK_LAB" |
| 93 | DIRECT COST | system (blank) | `=SUM(D87:D92)` |
| 94 | MISC 5% | system (blank) | `=D93*RATES!$C$<MISC_PCT>` — "direct × MISC_PCT" |
| 95 | OVERHEAD | system (blank) | `=(D93+D94)*RATES!$C$<OH_PCT>` — "(direct + misc) × OH_PCT" |
| 96 | UNIT COST IDR | system (blank) | `=D93+D94+D95` |
| 97 | Carton board m² (6 sides) | not in the 29 Sep template | `=L15` |
| 98 | PROJECT QTY × UNIT COST | not in the 29 Sep template | `=C4*D96` |

`<CODE>` stands for the row of that rate code on the RATES tab (see C1.5).

**18-line version (30 Sep reissue).** The single FINISHING line is replaced by four lines in this order after PANELS: FINISHING MATERIALS (`=D84*FIN_MAT`, note "exposed face m² × FIN_MAT (Zhanchen + thinner)"), SANDING MATERIALS (`=D84*SAND_MAT`, "exposed face m² × SAND_MAT (abrasives)"), SANDING LABOUR (`=D84*SAND_LAB`, "exposed face m² × SAND_LAB"), FINISHING LABOUR (`=D84*FIN_LAB`, "exposed face m² × FIN_LAB"). HARDWARE, PACKING, DIRECT COST, MISC 5%, OVERHEAD and UNIT COST IDR follow, each three rows lower than in the table above; the two extra rows (carton board m², project total) follow them. Title in the stack test: "SUMMARY (system) — rules T2, T3, F2, H1, K2, A1–A4 applied with the RATES tab".

### C2.9 Example data shipped in the template

**Tab `PL 085`** (yellow cells): C1 PL 085 · C2 DINING CHAIR (example from PLV BOM 27 Sep) · C3 Restaurant · C4 105 · C5 NC NATURAL · C6 N · C7 Example tab — replace · G1 520 · G2 560 · G3 810 · G7 27 Sep 2026.

| Row | MATERIAL | COMPONENT | L | W | T | QTY | EXPOSED | CURVED |
|---|---|---|---|---|---|---|---|---|
| 18 | TEAK | KAKI DEPAN | 610 | 45 | 45 | 2 | Y | N |
| 19 | TEAK | KAKI BELAKANG | 710 | 106 | 45 | 2 | Y | Y |
| 20 | TEAK | FRAME DUDUKAN DEPAN | 520 | 40 | 25 | 1 | N | N |
| 21 | TEAK | FRAME DUDUKAN SAMPING | 405 | 40 | 25 | 2 | N | N |
| 22 | TEAK | FRAME DUDUKAN BELAKANG | 460 | 40 | 25 | 1 | N | N |
| 23 | TEAK | FRAME LENGKUNG DUDUKAN | 300 | 75 | 40 | 2 | Y | Y |
| 24 | TEAK | FRAME LENGKUNG SANDARAN | 360 | 76 | 45 | 2 | Y | Y |

Panel line 1: PLY-18-TDF · DUDUKAN (seat panel) · 486 × 480 × 18 · qty 1 · exposed faces 2. Hardware line 1: Nylon glides 25 mm · qty 4 · pcs. With boxes blank the chair gives 1 carton, 2.64 m² of board and 0.286 m³ (figures reported for the v1 example with the same sizes).

**Tab `PL 0XX flatpack`**: C1 PL 0XX · C2 DINING TABLE (flatpack example) · C3 Restaurant · C4 20 · C5 NC NATURAL · C6 Y · C7 Example of 2 cartons · G1 1600 · G2 900 · G3 760. Box 1: Table top, 1600 × 900 × 60, qty 1. Box 2: Base / legs, 900 × 700 × 300, qty 1. Result reported: 2 cartons, 6.13 m², 0.39 m³.

### C2.10 Earlier versions (rejected)

Template v1 (29 Sep, two variants) used flat tables keyed by item code: ITEMS, COMPONENTS, HARDWARE, PACKING, LISTS, README, 400 prepared rows per table; the second variant folded four BOX blocks into the ITEMS row. Its extra check messages were `item code not on ITEMS`, `section?`, `material?`, `exposed Y/N?`, `panel bigger than sheet`, `T must match panel type`. The user rejected both flat layouts (D1, decisions 9 and 10).

---

## C3. Workflow as agreed [CHAT, 29 Sep 2026]

### C3.1 Architecture (phase 1)

```
Supabase (project john-lau-v01, schema ops_prod)
  bom_rates, bom_norms, finishing_recipes, bom_headers, bom_lines
        ▲ refreshRates()            ▼ submitBom() (with rate snapshot)
Google Sheet "PLV BOM" (Apps Script)
  hidden RATES tab  +  one tab per item, formulas only
        ▲
Operator: reads drawing, types sizes / qty / exposed flag / boxes
```

- Supabase is the single source of rates. "No price is ever hard-coded in the sheet."
- Every calculation (tier assignment, nesting with the 25% offcut rule, carton, misc, overhead) is a spreadsheet formula, so finance can check it.
- "Submit BOM" writes header and lines to Supabase with the rate values frozen, so a later rate change does not silently re-cost an issued BOM.
- Phase 2: the same rules become a BOM screen in ops.talaliving.com. "That is a UI job, not a logic rebuild, because rates and rules already live in Supabase."
- Claude is not the runtime. It is used to build the migration, the script and the formulas.

### C3.2 Who enters what

| Actor | Does |
|---|---|
| Operator | Reads the drawing. Per item: item code, name, area, project qty, finish recipe, flatpack Y/N, overall L × W × H, drawing / spec / photo links, packing boxes (only for flatpack). Per solid component: species, name, L, W, T, qty, exposed Y/N, curved Y/N, tier override only when disagreeing with the auto tier. Per panel: panel type, L, W, T, qty, exposed faces. Per hardware line: item master code, description, vendor, qty, unit, price if known. Types no rates. |
| System | Tier, component m³, timber cost, fasteners, panel nesting and sheets, finishing m² and the four finishing lines, carton sizes and packing cost, direct cost, misc, overhead, unit cost, project total. |
| Evin (owner) | Rate decisions and rulings on open items; says "go" before rates are loaded; corrects blue input cells by experience. Rate decisions are recorded in this Project. |
| IT team | Owns the build: migration, Apps Script, deployment with clasp, Script Properties, validation run, operator guide. |
| Staff (now) | Pre-fill component sizes and overall dimensions in Template v2 so the data can be pasted in once the system runs. |
| Finance | Can check every formula in the sheet. |

### C3.3 Rates: refresh, version, snapshot

- Rates are loaded into `ops_prod.bom_rates` (rate_code, category, basis, value, unit, valid_from, source) with `valid_from = 2026-10-01`; thresholds go into `ops_prod.bom_norms`. Row count is checked against the RATES tab.
- `refreshRates()` copies Supabase rates into the hidden RATES tab of the sheet. "Rates change only in Supabase, then Refresh. Never edit the RATES tab by hand."
- Rule S1: "On submit, every line stores the rate value used and rates_version (date). Later rate changes never re-cost an issued BOM." The stack test used `rates_version 2026-09-29`.
- A fixed refresh schedule (daily, weekly, on open) was not set: **NOT IN PROJECT CONTEXT**. Refresh is a manual menu action in the plan.

### C3.4 Submit and freeze

- `submitBom()` writes the item tab to `ops_prod.bom_headers` (one row per item BOM) and `ops_prod.bom_lines` (one row per component, panel, hardware line) with the rate snapshot.
- Before submit: the CHECK column must read OK on every filled line. Error messages to implement: missing item code, missing exposed flag, panel larger than sheet.
- What happens on re-submit of the same item (new revision versus overwrite), who may submit, and whether a submitted tab is locked in the sheet were not specified: **NOT IN PROJECT CONTEXT**.

### C3.5 Audit

- Formulas only in the sheet, so each cost line can be traced to inputs and a rate code.
- Rate rows carry a `source`; the catalogue tables carry evidence columns (`items.evidence_url / evidence_ref`, `item_vendor_prices.evidence_url / source_ref`) holding Drive nota links or price-list references.
- Staging tables `ops_procure.item_master_staging` and `item_vendor_prices_staging` were left in place for audit; invalid or duplicate catalogue items were archived or merged, not deleted.
- Validation step: re-cost 2–3 items already costed by hand (PL 085 / PL 086 in the 27 Sep BOM). "A difference is either a rate problem (fix in Supabase) or a rule problem (fix the formula). Report both to Evin before going on."
- A dedicated audit-log table for BOM edits was not specified: **NOT IN PROJECT CONTEXT**.

### C3.6 Google Sheets ↔ Supabase

- Bridge: Google Apps Script in the sheet, deployed with `clasp`. `SUPABASE_URL` and the service key are stored in Script Properties, "never in code".
- Functions: `buildTemplate()` (generates the per-item block layout of Template v2, hidden RATES tab, dropdowns for species, panel type and finish recipe, all formulas; generated by script so it is reproducible when a column changes), `refreshRates()` (Supabase → RATES tab), `submitBom()` (item tab → `bom_headers` + `bom_lines`), plus a custom menu.
- Tooling: Claude Code on desktop with the Supabase MCP and clasp.
- Existing Supabase objects (project john-lau-v01): `ops_procure.items`, `ops_procure.item_vendor_prices`, `ops_prod.bom_norms`, `ops_prod.finishing_recipes`. To be created: `ops_prod.bom_rates`, `ops_prod.bom_headers`, `ops_prod.bom_lines`.
- Hardware prices come from `ops_procure.item_vendor_prices` (dropdown), not from the rate card.
- Status on 29 Sep: "Nothing has been built in Supabase or Apps Script for the BOM yet." No later build is recorded in this Project.

### C3.7 The four-day plan (kicked off 29 Sep 2026)

| Day | Work | Who |
|---|---|---|
| 1 — Freeze inputs | Finish remaining rates (overhead %, panel per-sheet rates, carton prices); one rate sheet with every value, unit and source; one-page rule spec. Owner reads both (1–2 h), corrects numbers, says "go". | Claude, then the owner. **Done 29 Sep except the owner's "go".** |
| 2 — Supabase and template | Migration for `bom_rates`, norm rows, `bom_headers`, `bom_lines`; load rates; `buildTemplate()`; review and apply migration; create Apps Script project, push with clasp, set Script Properties, run `buildTemplate()`. | Claude Code + IT |
| 3 — Sync and submit | `refreshRates()`, `submitBom()`, custom menu, error messages; deploy; re-cost PL 085 / PL 086 and compare with the manual numbers. | Claude Code + IT |
| 4 — Operator run | One-page operator guide in English and Indonesian; first 5–10 real items with the operator; then the operator runs alone and the owner only touches rates in Supabase. Paste in the pre-filled Template v2 data for the remaining items. | Claude, IT, operator |

Time estimate given: about 4 working days end to end, roughly half of it the owner's time; the mechanics are about 1½ days of Claude work; the critical path is freezing the rate numbers.

### C3.8 Standing rules for the team (verbatim from the IT briefing)

- Item code is the join key everywhere; it must be identical across tabs and in Supabase.
- Rates change only in Supabase, then Refresh. Never edit the RATES tab by hand.
- Exposed Y/N is the one judgement call per component; it drives both the tier and the finishing m². Spend five minutes on examples with the operator.
- STMV items not relevant to PLV (bleach, stainless screws, subcontracted CNC/lathe, KSA/Sayerlac) stay out of the rates; they go as project-level lines on the quote.
- Rate decisions are Evin's and get recorded in this Project; IT owns the build.

Blocking item stated in the briefing: "Rate freeze. Evin must rule on OPEN_ITEMS, especially #1 (carpentry labour ÷ component m³ = 7.47 jt vs ÷ rough-sawn m³ = 2.92 jt — a 2.5× difference), #4 and #8 (overhead denominator). Do not load rates into Supabase before he says "go"."

Template rule for operators: if an item has more than 25 solid parts, use a second tab ("PL 085 (2)") rather than inserting rows, because inserting rows breaks the fixed positions.

---

## C4. The 12-item stack test [DRIVE]

Google Sheet `PLV_BOM_Stack_Test_12_Items_30Sep26`, SUMMARY tab (used range A1:N78), reproduced in full. Workbook tabs: SUMMARY; twelve comparison tabs (`AA-02 cmp`, `AA-03AB cmp`, `AA-04A cmp`, `AA-04B cmp`, `AA-07A cmp`, `LT-02 cmp`, `SG-01A cmp`, `TB-02 cmp`, `OV-501 cmp`, `AA-29 cmp`, `OV-505 B cmp`, `ID-OV-506 cmp`; used ranges A1:W27 to A1:W45); twelve item tabs in Template v2 format (A1:S102 each); `RATES` (A1:E65); `LISTS` (A1:F37).

**Not in this export:** the twelve "cmp" tabs (original costing reproduced in full, new estimate line by line, reason for each difference, per component) and the twelve item tabs. The Drive connector returned only their structure. Their line-level content is **NOT IN PROJECT CONTEXT**; tables 2 and 3 below are the per-line differences at cost-group level.

**Sheet title (A1):** PLV BOM STACK TEST — 12 STMV items re-costed with the new format, rules and rates

**Subtitle (A2):** 30 Sep 2026 · Old BOM: REVISI BOM 21 MEI 26 · Rates: Rate Card 29 Sep 26 with the 40 × 40 tier rule and finishing in four lines · Format: Input Template v2, one tab per item. All figures IDR. Each item has a "cmp" tab with the original costing in full, the new estimate line by line, and the reason for each difference.


### C4.1 1. UNIT COST AND PROJECT TOTAL

| Item | Name | Project qty | Old BOM / unit | New estimate / unit | Diff / unit | Diff % | Old BOM total | New estimate total | Diff total | STMV allocated actual / unit | New ÷ actual |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AA-02 | ROUND MIRROR @ BEDROOM | 121 | 514,913 | 753,807 | 238,894 | +46% | 62,304,519 | 91,210,678 | 28,906,158 | 689,849 | 109% |
| AA-03A&B | ROUND MIRROR @ BATHROOM (A = OWV, B = BV) | 122 | 1,251,464 | 1,713,065 | 461,601 | +37% | 152,678,666 | 208,993,968 | 56,315,303 | 1,654,502 | 104% |
| AA-04A | VANITY MIRROR @ BEACH VILLA | 60 | 1,180,278 | 1,735,869 | 555,591 | +47% | 70,816,668 | 104,152,136 | 33,335,468 | 1,449,897 | 120% |
| AA-04B | VANITY MIRROR @ OVERWATER | 91 | 1,682,801 | 2,538,936 | 856,135 | +51% | 153,134,857 | 231,043,160 | 77,908,303 | 2,180,972 | 116% |
| AA-07A | FULL LENGTH MIRROR @ BEACH VILLA | 30 | 1,152,626 | 1,680,940 | 528,314 | +46% | 34,578,773 | 50,428,187 | 15,849,414 | 1,484,547 | 113% |
| LT 02 | WALL SCONCE @ VANITY | 248 | 421,051 | 498,199 | 77,148 | +18% | 104,420,698 | 123,553,453 | 19,132,756 | 650,817 | 77% |
| SG-01A | ARM CHAIR / LOUNGE CHAIR (costing 11 March 26) | 120 | 1,804,694 | 2,397,558 | 592,865 | +33% | 216,563,246 | 287,707,020 | 71,143,774 | 2,810,164 | 85% |
| TB-02 | SIDE TABLE (base and leg only) | 118 | 1,048,220 | 1,484,874 | 436,654 | +42% | 123,690,007 | 175,215,165 | 51,525,158 | 1,312,211 | 113% |
| OV-501 | SHELF MINIBAR | 89 | 851,281 | 1,109,025 | 257,744 | +30% | 75,764,005 | 98,703,218 | 22,939,212 | 1,061,884 | 104% |
| AA-29 | FULL LENGTH MIRROR, EXISTING @ OVERWATER | 91 | 420,036 | 353,537 | (66,499) | -16% | 38,223,276 | 32,171,832 | (6,051,444) | 701,433 | 50% |
| OV-505 B / BV 505 B | SHELF BELOW VANITY COUNTER | 236 | 794,101 | 725,983 | (68,117) | -9% | 187,407,793 | 171,332,078 | (16,075,715) | 1,067,845 | 68% |
| ID-OV-506 | A/C COVER @OVERWATER (KECIL) | 109 | 594,047 | 766,148 | 172,101 | +29% | 64,751,073 | 83,510,085 | 18,759,012 | 804,497 | 95% |
| TOTAL, 12 items |  | 1,435 |  |  |  | +29% | 1,284,333,580 | 1,658,020,980 | 373,687,400 | 1,766,822,431 | 94% |

Note under the table: Allocated actual: STMV_BOM_vs_Actual_Reconciliation 23 Sep, COST BY ITEM — ledger actuals spread pro-rata on budget; includes labour for other work and one-off overhead, so it is indicative only. The total row shows the project total (qty × actual / unit) in that column.


### C4.2 2. WHERE THE DIFFERENCE COMES FROM — new minus old, per unit, by cost group

| Item | Name | Timber (wood + processing) | Panels | Carpentry labour | Finishing + sanding | Bought-in + outside labour | Fasteners | Packing | Misc + overhead | Total diff / unit |
|---|---|---|---|---|---|---|---|---|---|---|
| AA-02 | ROUND MIRROR @ BEDROOM | 98,947 | 12,500 | 28,784 | (17,722) | - | 16,874 | 19,205 | 80,305 | 238,894 |
| AA-03A&B | ROUND MIRROR @ BATHROOM (A = OWV, B = BV) | 182,928 | 38,000 | 779 | (27,771) | - | 31,196 | 59,993 | 176,476 | 461,601 |
| AA-04A | VANITY MIRROR @ BEACH VILLA | 174,664 | 20,000 | 93,984 | 6,928 | - | 43,261 | 31,422 | 185,332 | 555,591 |
| AA-04B | VANITY MIRROR @ OVERWATER | 288,762 | 35,750 | 131,354 | 10,200 | - | 67,527 | 48,247 | 274,296 | 856,135 |
| AA-07A | FULL LENGTH MIRROR @ BEACH VILLA | 133,253 | 21,250 | 117,689 | (10,006) | - | 45,635 | 41,742 | 178,749 | 528,314 |
| LT 02 | WALL SCONCE @ VANITY | 48,575 | - | 35,338 | (6,769) | - | 8,284 | (16,389) | 8,108 | 77,148 |
| SG-01A | ARM CHAIR / LOUNGE CHAIR (costing 11 March 26) | 48,542 | - | 65,234 | 58,383 | - | 39,664 | 137,991 | 243,052 | 592,865 |
| TB-02 | SIDE TABLE (base and leg only) | 278,564 | - | 118,562 | (73,287) | - | 22,872 | 31,326 | 58,618 | 436,654 |
| OV-501 | SHELF MINIBAR | (24,383) | - | 90,342 | 89,964 | - | 30,479 | 38,958 | 32,383 | 257,744 |
| AA-29 | FULL LENGTH MIRROR, EXISTING @ OVERWATER | 13,137 | (7,945) | (43,218) | (17,981) | - | 9,208 | (5,245) | (14,454) | (66,499) |
| OV-505 B / BV 505 B | SHELF BELOW VANITY COUNTER | (13,089) | - | (8,684) | (54,687) | - | 18,294 | 8,324 | (18,275) | (68,117) |
| ID-OV-506 | A/C COVER @OVERWATER (KECIL) | 41,583 | - | 13,878 | 75,920 | - | 8,025 | 11,316 | 21,378 | 172,101 |

### C4.3 3. NEW ESTIMATE PER UNIT, BY LINE

| Item | Unit cost | Timber (wood + processing) | Carpentry labour | Panels | Finishing materials | Sanding materials | Sanding labour | Finishing labour | Bought-in + outside labour | Fasteners | Packing | Misc | Overhead |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AA-02 | 753,807 | 164,010 | 71,984 | 107,500 | 8,321 | 2,741 | 8,456 | 19,011 | 159,200 | 16,874 | 77,263 | 31,768 | 86,679 |
| AA-03A&B | 1,713,065 | 303,213 | 133,079 | 230,000 | 15,382 | 5,067 | 15,633 | 35,147 | 462,800 | 31,196 | 212,371 | 72,194 | 196,983 |
| AA-04A | 1,735,869 | 341,468 | 184,547 | 172,000 | 15,857 | 5,223 | 16,116 | 36,232 | 540,800 | 43,261 | 107,605 | 73,155 | 199,605 |
| AA-04B | 2,538,936 | 549,133 | 288,066 | 225,750 | 24,598 | 8,102 | 24,999 | 56,204 | 717,200 | 67,527 | 178,408 | 106,999 | 291,948 |
| AA-07A | 1,680,940 | 309,212 | 194,675 | 215,000 | 28,931 | 9,529 | 29,403 | 66,105 | 357,000 | 45,635 | 161,320 | 70,841 | 193,289 |
| LT 02 | 498,199 | 80,516 | 35,338 | - | 2,626 | 865 | 2,669 | 6,000 | 266,995 | 8,284 | 16,623 | 20,996 | 57,287 |
| SG-01A | 2,397,558 | 728,250 | 169,202 | - | 32,834 | 10,815 | 33,368 | 75,020 | 750,200 | 39,664 | 181,474 | 101,041 | 275,691 |
| TB-02 | 1,484,874 | 675,464 | 118,562 | - | 11,747 | 3,869 | 11,938 | 26,840 | 285,000 | 27,793 | 90,342 | 62,578 | 170,743 |
| OV-501 | 1,109,025 | 559,627 | 145,379 | - | 25,206 | 8,302 | 25,617 | 57,593 | 14,000 | 34,079 | 64,958 | 46,738 | 127,525 |
| AA-29 | 353,537 | 48,642 | 39,282 | 20,125 | 9,420 | 3,103 | 9,573 | 21,523 | 84,450 | 9,208 | 52,660 | 14,899 | 40,653 |
| OV-505 B / BV 505 B | 725,983 | 300,408 | 78,040 | - | 18,424 | 6,068 | 18,724 | 42,096 | 38,000 | 18,294 | 91,854 | 30,595 | 83,480 |
| ID-OV-506 | 766,148 | 318,992 | 82,867 | - | 24,937 | 8,214 | 25,343 | 56,977 | - | 19,425 | 109,006 | 32,288 | 88,098 |

### C4.4 4. FINISHING AREA — one face per component (as costed) against all faces

| Item | Name | m² old BOM charged | m² one face (costed) | m² all faces | Unit cost, all faces | vs old BOM |
|---|---|---|---|---|---|---|
| AA-02 | ROUND MIRROR @ BEDROOM | 0.188 | 0.214 | 0.701 | 857,714 | +67% |
| AA-03A&B | ROUND MIRROR @ BATHROOM (A = OWV, B = BV) | 0.330 | 0.396 | 1.253 | 1,895,910 | +51% |
| AA-04A | VANITY MIRROR @ BEACH VILLA | 0.475 | 0.408 | 1.494 | 1,967,631 | +67% |
| AA-04B | VANITY MIRROR @ OVERWATER | 0.741 | 0.633 | 2.239 | 2,881,588 | +71% |
| AA-07A | FULL LENGTH MIRROR @ BEACH VILLA | 1.028 | 0.745 | 1.901 | 1,927,720 | +67% |
| LT 02 | WALL SCONCE @ VANITY | 0.135 | 0.068 | 0.208 | 528,161 | +25% |
| SG-01A | ARM CHAIR / LOUNGE CHAIR (costing 11 March 26) | 0.669 | 0.845 | 2.785 | 2,811,426 | +56% |
| TB-02 | SIDE TABLE (base and leg only) | 0.912 | 0.302 | 0.842 | 1,600,112 | +53% |
| OV-501 | SHELF MINIBAR | 0.191 | 0.649 | 1.688 | 1,330,717 | +56% |
| AA-29 | FULL LENGTH MIRROR, EXISTING @ OVERWATER | 0.440 | 0.243 | 0.679 | 446,645 | +6% |
| OV-505 B / BV 505 B | SHELF BELOW VANITY COUNTER | 1.000 | 0.474 | 1.708 | 989,239 | +25% |
| ID-OV-506 | A/C COVER @OVERWATER (KECIL) | 0.283 | 0.642 | 1.982 | 1,052,042 | +77% |

### C4.5 5. HOW THE OLD DATA WAS ENTERED, AND WHAT NEEDS A RULING

1. Source block per item is the one the 23 Sep budget reconciliation uses: SG-01A = costing 11 March 26, TB-02 = teak version, OV-501 = shelf minibar, AA-03A&B = one costing for both (91 + 31 pcs).

2. Timber: sizes and quantities as in the old BOM, entered longest side first. All components EXPOSED = Y. Tier by rule T1 with the 40 × 40 rule. CURVED = Y only where the part is clearly curved or turned: round-mirror frame segments (AA-02, AA-03), lamp housings and corner blocks of the vanity mirrors (AA-04A/B), the turned lamp cover (LT 02), the turned post (TB-02), the two corner pieces of the chair (SG-01A). These are my reading of the parts; change column I on the item tab if wrong.

3. Mindi is where the timber line moves most: old flat price 6.75 jt per m³; new wood + processing 9.2 jt (B), 12.9 jt (A) or 17.0 jt (A-CURVED), plus carpentry labour.

4. Panels: the old BOM mostly gives plywood as a number of sheets with no size. Template addition: a SHEETS (manual) column on the panel lines, used where there is no size (round, oversize, laminated). Where the old BOM gives a size (AA-04B, AA-29) the nesting rule is applied. All are raw backing boards at the Mojo Indah Sep 2026 sheet price, 0 exposed faces.

5. Glass, LED parts, hanging hardware, foam, fabric, steel plate, gliders and outside labour (turning, upholstery, laser cutting, powder coat) are carried at old BOM prices on the bought-in lines. Where a part is turned outside (LT 02, TB-02) the carpentry labour inside its tier rate may partly double count.

6. Packing: assembled items use the template default, 1 carton = overall size + 40 mm, and this replaces both the purchased box and the packing line of the old BOM. Flatpack items (OV-505 B, OV-501, TB-02) use the old packed sizes as box rows; TB-02 is 2 tables per carton, entered as 0.5 carton. Open crates for the mirrors are in neither estimate.

7. Finishing: four lines (finishing materials, sanding materials, sanding labour, finishing labour) on the largest face of each exposed component. Table 4 shows how far that area is from all faces, and from the area the old BOM charged. This is the largest open question in the stack (OPEN_ITEMS 2).

8. Misc in the old BOM is 8% on most mirrors and the chair and 20% elsewhere; the new stack is 5% misc + 13.0% overhead on every item.

9. Rates are the 29 Sep card with its open items unresolved (teak log 10.9 jt, mindi log 3.1 jt, yields by judgement). Change the blue cells on RATES to re-run everything.


Reading notes for these tables: amounts are IDR per unit unless a column says "total"; figures in brackets are negative; "-" is zero. Table C4.2 is the per-line difference at cost-group level (new minus old). In table C4.4 "vs old BOM" compares the all-faces unit cost with the old BOM unit cost.

All-faces unit cost against the one-face (costed) unit cost, calculated for this export from tables C4.1 and C4.4:

| Item | New estimate / unit (one face) | Unit cost, all faces | Increase |
|---|---|---|---|
| AA-02 | 753,807 | 857,714 | +13.8% |
| AA-03A&B | 1,713,065 | 1,895,910 | +10.7% |
| AA-04A | 1,735,869 | 1,967,631 | +13.4% |
| AA-04B | 2,538,936 | 2,881,588 | +13.5% |
| AA-07A | 1,680,940 | 1,927,720 | +14.7% |
| LT 02 | 498,199 | 528,161 | +6.0% |
| SG-01A | 2,397,558 | 2,811,426 | +17.3% |
| TB-02 | 1,484,874 | 1,600,112 | +7.8% |
| OV-501 | 1,109,025 | 1,330,717 | +20.0% |
| AA-29 | 353,537 | 446,645 | +26.3% |
| OV-505 B / BV 505 B | 725,983 | 989,239 | +36.3% |
| ID-OV-506 | 766,148 | 1,052,042 | +37.3% |

Range: +6.0% to +37.3%. (The chat message that delivered the workbook said "roughly 6% to 27% per item"; the table above shows the two slatted items OV-505 B and ID-OV-506 above that range.)


### C4.6 The two-item test that preceded it (30 Sep 2026) [CHAT]

Workbook `PLV_BOM_Stack_Test_OV-505B_ID-OV-506_30Sep26` (v2 in Drive), tabs SUMMARY, COMPARISON, OV-505 B, ID-OV-506, OLD BOM, RATES, LISTS.

**Inputs entered (from the old BOM, REVISI BOM 21 MEI 26):**

| Item | Header | Solid components (species, name, L × W × T, qty; all EXPOSED = Y, CURVED = N) | Packing | Hardware |
|---|---|---|---|---|
| OV-505 B / BV 505 B — SHELF BELOW VANITY COUNTER | project qty 236 (OV 178 + BV 58); overall 1200 × 550 × 438; recipe OTHER; flatpack Y; source rows 692–706 | TEAK KAKI 450 × 33 × 33 × 4 (old BOM: BELAH 40) · TEAK FRAME PANJANG 1150 × 33 × 33 × 2 (old BOM: BELAH 25) · TEAK FRAME PENDEK 500 × 33 × 33 × 2 · TEAK SLAT 720 × 25 × 16 × 17 | one box "KD flat, 1 package", 1220 × 620 × 50, qty 1 | NANASAN + BAUT JCBC SST 4 pcs at 3,500 · PLAT SIKU SST 4 pcs at 6,000 (old BOM prices) |
| ID-OV-506 — A/C COVER @OVERWATER (KECIL) | project qty 109; overall 1165 × 291 × 407; recipe OTHER; flatpack N; source rows 650–660 | TEAK KAYU SAMPING 375 × 275 × 20 × 2 (old BOM: BELAH 25; 275 mm wide board) · TEAK SLAT 1165 × 22 × 16 × 17 | boxes blank (one carton from overall size) | none |

**Old BOM lines as copied (values only):**

| ITEM | SRC ROW | MATERIAL | LINE | L | W | H / T | QTY / UNIT | M2 FLAT | M2 3D | M3 | RATE | TOTAL IDR | REMARK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID-OV-506 | 650 | | A/C COVER @OVERWATER ( KECIL ) — header, project qty 109 | 1165 | 291 | 407 | 1 | 0.339015 | 2.170894 | 0.137979105 | | | |
| ID-OV-506 | 651 | KAYU JATI | KAYU SAMPING | 375 | 275 | 20 | 2 | 0.20625 | 0.34905 | 0.004125 | 25000000 | 103125 | BELAH 25 |
| ID-OV-506 | 652 | KAYU JATI | SLAT | 1165 | 22 | 16 | 17 | 0.43571 | 0.291324 | 0.00697136 | 25000000 | 174284 | |
| ID-OV-506 | 653 | | FINISHING | 1165 | 291 | 407 | 1 | 0.565 | 2.170894 | 0.137979105 | 140000 | 39550 | 0.565 m² × 140,000 × ½ |
| ID-OV-506 | 654 | | SCREW | 0 | 0 | 0 | 38 | 0 | 0.0096 | 0 | 300 | 11400 | |
| ID-OV-506 | 655 | | LABOR PRODUKSI | 1165 | 291 | 407 | 1 | 0.339015 | 2.170894 | 0.137979105 | 1500000 | 68989.5525 | 1.5 jt × L×W×H of the item ÷ 3 |
| ID-OV-506 | 656 | | PACKING | 1165 | 291 | 407 | 1 | 0.339015 | 2.170894 | 0.137979105 | 45000 | 97690.23 | 45,000 × M2 3D |
| ID-OV-506 | 657 | | MISC | | | | | | | | 0.2 | 99007.7565 | 20% of lines above |
| ID-OV-506 | 658 | | TOTAL | | | | | | | | | 594046.539 | |
| ID-OV-506 | 660 | | PACKING SESUAI PL | 1205 | 331 | 447 | 1 | 0.398855 | 2.497774 | 0.178288185 | | | carton per packing list |
| OV-505 B | 692 | | SHELF BELOW VANITY COUNTER — header, project qty 236 (OV 178 + BV 58) | 1200 | 550 | 438 | 1 | 0.66 | 3.21268 | 0.28908 | | | |
| OV-505 B | 693 | KAYU JATI | KAKI | 450 | 33 | 33 | 4 | 0.0594 | 0.153738 | 0.0019602 | 30000000 | 58806 | BELAH 40 |
| OV-505 B | 694 | KAYU JATI | FRAME PANJANG | 1150 | 33 | 33 | 2 | 0.0759 | 0.358138 | 0.0025047 | 30000000 | 75141 | BELAH 25 |
| OV-505 B | 695 | KAYU JATI | FRAME PENDEK | 500 | 33 | 33 | 2 | 0.033 | 0.168338 | 0.001089 | 30000000 | 32670 | |
| OV-505 B | 696 | KAYU JATI | SLAT | 720 | 25 | 16 | 17 | 0.306 | 0.1912 | 0.004896 | 30000000 | 146880 | |
| OV-505 B | 697 | | FINISHING | 0 | 0 | 0 | 0 | 0 | 3.21268 | 0 | 140000 | 140000 | flat 1 m² (placeholder qty) |
| OV-505 B | 698 | | PACKING | 0 | 0 | 0 | 0 | 0 | 3.21268 | 0 | 26000 | 83529.68 | 26,000 × M2 3D |
| OV-505 B | 699 | | NANASAN + BAUT JCBC SST | 0 | 0 | 0 | 4 | 0 | 0.0096 | 0 | 3500 | 14000 | |
| OV-505 B | 700 | | PLAT SIKU SST | 0 | 0 | 0 | 4 | 0 | 0.0096 | 0 | 6000 | 24000 | |
| OV-505 B | 701 | | LABOR PRODUKSI | 0 | 0 | 0 | 0 | 0 | 0.0096 | 0.28908 | 1500000 | 86724 | 1.5 jt × L×W×H of the item × 0.2 |
| OV-505 B | 702 | | MISC | | | | | | | | 0.2 | 132350.136 | 20% of lines above |
| OV-505 B | 703 | | TOTAL | | | | | | | | | 794100.816 | |
| OV-505 B | 706 | | PACKING 1 ITEM | 1220 | 620 | 50 | 1 | 0.7564 | 2.0088 | 0.03782 | | | packed size |

**Result with the rules as written on 29 Sep (before the 40 × 40 rule), per unit, IDR:**

| Per unit (IDR) | OV-505 B old | OV-505 B new | ID-OV-506 old | ID-OV-506 new |
|---|---|---|---|---|
| Timber (wood + processing) | 313,497 | 329,209 | 277,409 | 399,156 |
| Carpentry labour | 86,724 | 78,040 | 68,990 | 82,867 |
| Finishing | 140,000 | 85,313 | 39,550 | 115,470 |
| Fasteners + hardware | 38,000 | 56,294 | 11,400 | 19,425 |
| Packing | 83,530 | 91,854 | 97,690 | 109,006 |
| Misc (old 20%, new 5%) | 132,350 | 32,035 | 99,008 | 36,296 |
| Overhead (new 13%) | 0 | 87,409 | 0 | 99,034 |
| **Unit cost** | **794,101** | **760,154** | **594,047** | **861,256** |
| Project total (236 / 109 pcs) | 187.4m | 179.4m | 64.8m | 93.9m |

**Unit cost under each version of the tier rule:**

| Unit cost (IDR) | Old BOM | Rule as written 29 Sep | Slats overridden to tier D (scenario) | With the 40 × 40 / 1500 rule (final) | Final vs old BOM |
|---|---|---|---|---|---|
| OV-505 B | 794,101 | 760,154 | 693,360 (−13%) | 725,983 | −9% |
| ID-OV-506 | 594,047 | 861,256 | 671,040 (+13%) | 766,148 | +29% |

Further figures from this test: with finishing on all faces under the 29 Sep rule the unit costs become 1,023,410 (OV-505 B) and 1,147,150 (ID-OV-506); one-face finishing area is 0.47 m² for the shelf and 0.64 m² for the cover against about 1.7 and 2.0 m² on all faces; across both items at project quantity the final new stack is 254.8m against 252.2m in the old BOM, about 1% apart; STMV allocated actual per unit 1,067,844.759 (OV-505 B) and 804,496.6245 (ID-OV-506).

**Findings and assumptions of the two-item test (final wording, 30 Sep):**

1. Mechanics work: the old component take-off drops straight into the template; tiers, m³, carton size and all cost lines compute from the RATES tab, and the new totals tie to the item tabs (check rows on the compare tabs = 0).
2. Tier rule T1 revised 30 Sep: an exposed part with a cross-section up to 40 × 40 mm takes tier B up to 1500 mm long (NARROW_MAX_SECTION and NARROW_MAX_LEN on LISTS). The 1165 mm A/C cover slats and the 1150 mm shelf rails are tier B. Parts with a larger section still go to A from 1000 mm.
3. ID-OV-506 KAYU SAMPING is a 275 mm wide board. Entered as CURVED = N (tier B). If it counts as "wide board" it becomes A-CURVED; there is no width threshold in NORMS yet.
4. Finishing is now four lines: finishing materials (Zhanchen + thinner), sanding materials (abrasives), sanding labour (65% of the sanding payroll) and finishing labour. The four rates add up to the same 179,871 per m² as the 29 Sep card. The item tab summary therefore has 18 lines instead of 15.
5. Finishing m²: the template counts L × W once per exposed component. For slatted items that is about a third of the real painted surface (scenario B). The STMV denominator (2,166 m²) used 0.565 m² for ID-OV-506 and 2.0 m² for OV-505 B, so it was not consistent either — OPEN_ITEMS 2.
6. OV-505 B ships flat. The old BOM gives one packed size (1220 × 620 × 50); it is entered as one box and the template adds 40 mm per side. If that size is already the outer size, packing is slightly overstated.
7. Hardware on OV-505 B carried at old BOM prices; stainless screws are outside the rate build. All components entered as EXPOSED = Y; finish recipe left as OTHER (flat rates).
8. Rates are the 29 Sep card with its open items unresolved (teak log 10.9 jt implied, yields A 3.5 / B 2.5 / D 1.5 by judgement). Change the blue cells on RATES to re-run.

A note from the first version of this test, later dropped from the list: "Labour: old BOM charged 1.5 jt per m³ on a fraction of the item's gross volume (⅓ and 0.2 on these two); the new stack charges 7.47 jt per m³ of component. On these two items the results differ in opposite directions, which is the driver change, not an error."

---

