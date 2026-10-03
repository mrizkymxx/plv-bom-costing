/**
 * Automated Verification Suite for PLV BOM Costing Engine
 * Dual Verification:
 * 1. Legacy Stack (30 Sep 2026): Log Teak 10.9M, 1-face finishing
 * 2. Active Owner Formula (02 Oct 2026): Log Teak 6.0M (Q-5), 6-face finishing (Q-2)
 */

const fs = require('fs');
const path = require('path');
const engine = require('./engine.js');

const fixturesDir = path.join(__dirname, 'fixtures');

// 1. LEGACY INPUTS (30 Sep 2026)
const rateInputsLegacy = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'rate-inputs-2026-09-29.json'), 'utf8'));
const panelInputs = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'panel-inputs-2026-09-29.json'), 'utf8'));
const normsLegacy = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'norms-2026-09-30.json'), 'utf8'));

const ratesLegacy = {
  ...engine.deriveRates(rateInputsLegacy, normsLegacy),
  ...engine.derivePanelRates(panelInputs)
};

// 2. ACTIVE OWNER INPUTS (02 Oct 2026 - Q-1 to Q-27 Decisions)
const rateInputsActive = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'rate-inputs-active-2026-10-02.json'), 'utf8'));
const normsActive = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'norms-active-2026-10-02.json'), 'utf8'));

const ratesActive = {
  ...engine.deriveRates(rateInputsActive, normsActive),
  ...engine.derivePanelRates(panelInputs)
};

const items = [
  { file: 'ov-505b.json', code: 'OV-505 B', legacyExpected: 725983, activeExpected: 837363 },
  { file: 'id-ov-506.json', code: 'ID-OV-506', legacyExpected: 766148, activeExpected: 890771 },
  { file: 'tb-02.json', code: 'TB-02', legacyExpected: 1484874, activeExpected: 1258621 },
  { file: 'aa-04b.json', code: 'AA-04B', legacyExpected: 2538936, activeExpected: 2863975 }
];

console.log("================================================================================");
console.log("             PLV COSTING ENGINE - HARGA LAMA VS KALKULASI BARU                  ");
console.log("================================================================================");
console.log("Perubahan Formula Baru (Keputusan Owner Q-1 s/d Q-27):");
console.log(" - Q-5: Harga Log Jati turun dari Rp 10.900.000 -> Rp 6.000.000 / m³");
console.log(" - Q-5: Harga Log Mindi turun dari Rp 3.100.000 -> Rp 3.000.000 / m³");
console.log(" - Q-2: Luas finishing kayu solid dihitung 6-MUKA (semua sisi), bukan 1-muka");
console.log("================================================================================");

let allPassed = true;
items.forEach(it => {
  const input = JSON.parse(fs.readFileSync(path.join(fixturesDir, it.file), 'utf8'));
  
  // Calculate Legacy
  const resLegacy = engine.costItem(input, ratesLegacy, normsLegacy);
  const costLegacy = Math.round(resLegacy.unit_cost);
  
  // Calculate Active New
  const resActive = engine.costItem(input, ratesActive, normsActive);
  const costActive = Math.round(resActive.unit_cost);
  const delta = costActive - costLegacy;
  const deltaStr = (delta >= 0 ? "+" : "") + delta.toLocaleString('id-ID');

  console.log(`[${it.code.padEnd(10)}]`);
  console.log(`  Tarif Lama (30 Sep)   : Rp ${costLegacy.toLocaleString('id-ID').padStart(11)}`);
  console.log(`  Kalkulasi Baru (Aktif): Rp ${costActive.toLocaleString('id-ID').padStart(11)}`);
  console.log(`  Perubahan Harga       : Rp ${deltaStr.padStart(11)}`);
  console.log("--------------------------------------------------------------------------------");

  if (costLegacy !== it.legacyExpected || costActive !== it.activeExpected) {
    allPassed = false;
  }
});

if (allPassed) {
  console.log("STATUS: SEMUA HARGA KALKULASI BARU TERVERIFIKASI PRESISI SAMPAI KE RUPIAH!");
  process.exit(0);
} else {
  console.error("STATUS: ADA SELISIH KALKULASI!");
  process.exit(1);
}
