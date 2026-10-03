/**
 * PLV BOM Costing Engine - Zero-dependency JavaScript implementation
 * Strict implementation of rules T1-T3, P1-P4, F1-F2, K1-K2, H1, A1-A4
 * Extended for Custom Parts, Subcontracts, Dynamic Columns, and Tolerant Parsing
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BOMEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const ENGINE_VERSION = "2.0.0-PROD";
  const PANEL_THICKNESSES = [3, 6, 9, 12, 15, 18, 24];
  const PANEL_FACES = ["RAW", "MSF", "MDF", "TSF", "TDF"];

  function filled(v) {
    return v !== undefined && v !== null && v !== "";
  }

  function normOf(norms, code) {
    const val = norms[code];
    if (val === undefined) throw new Error(`Missing norm: ${code}`);
    return val;
  }

  function rateOf(rates, code) {
    const val = rates[code];
    if (val === undefined) throw new Error(`Missing rate: ${code}`);
    return val;
  }

  function median3(a, b, c) {
    return a + b + c - Math.min(a, b, c) - Math.max(a, b, c);
  }

  function deriveRates(inputs, norms) {
    const i = inputs;
    const LAB_CARP = (i.carp_pool * (1 - i.carp_deduct)) / i.comp_m3;
    const teak = (yieldFactor) => (i.log_teak + i.processing) * yieldFactor + LAB_CARP;
    const mindi = (yieldFactor) => (i.log_mindi + i.processing) * yieldFactor + LAB_CARP;

    const FIN_MAT = i.paint_total / i.fin_m2;
    const SAND_MAT = i.abrasive_total / i.fin_m2;
    const SAND_LAB = (i.sand_pool * i.sand_keep) / i.fin_m2;
    const FIN_LAB = i.fin_pool / i.fin_m2;

    const rates = {
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

      MERANTI: i.meranti_sawn * i.yield_MER + LAB_CARP,
      FASTENERS: i.fast_total / i.comp_m3,

      FIN_MAT,
      SAND_MAT,
      SAND_LAB,
      FIN_LAB,
      FIN_ALL: FIN_MAT + SAND_MAT + SAND_LAB + FIN_LAB,

      CARTON_M2: i.carton_m2,
      PACK_LAB: i.pack_lab,
      GRP_A: i.grp_a,

      MISC_PCT: i.misc_pct,
      OH_PCT: i.oh_pool / i.stmv_direct,
      USD_IDR: i.usd_idr
    };

    if (norms) {
      if (norms.CARTON_MIN_M2 !== undefined) rates.CARTON_MIN_M2 = norms.CARTON_MIN_M2;
      if (norms.KD_PACK_FACTOR !== undefined) rates.KD_PACK_FACTOR = norms.KD_PACK_FACTOR;
    }
    return rates;
  }

  function derivePanelRates(inputs) {
    const sheetArea = inputs.sheet_L * inputs.sheet_W;
    const gluePerFace = inputs.glue_tape * sheetArea;
    const teakVeneerPerFace = inputs.ven_teak * inputs.ven_len;
    const mindiVeneerPerFace = inputs.ven_mindi * inputs.ven_len;
    const labourPerFace = inputs.ven_labour;
    const teakAdd = teakVeneerPerFace + gluePerFace + labourPerFace;
    const mindiAdd = mindiVeneerPerFace + gluePerFace + labourPerFace;

    const rates = {};
    for (const t of PANEL_THICKNESSES) {
      const raw = inputs.ply[t] !== undefined ? inputs.ply[t] : inputs.ply[String(t)];
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

  function autoTier(line, norms, version = "2026-09-30") {
    const { l, w, t } = line;
    if (l === undefined || l === null) return null;
    if (line.tier_override) return line.tier_override;
    if (w === undefined || w === null || t === undefined || t === null) return null;

    const maxDim = Math.max(l, w, t);
    const volOnePiece = (l * w * t) / 1e9;

    if (volOnePiece < normOf(norms, "TIER_D_MAX_VOL") && maxDim < normOf(norms, "TIER_D_MAX_LEN")) {
      return "D";
    }

    if (line.exposed === "N") return "C";
    if (line.curved === "Y") return "A-CURVED";

    if (version === "2026-09-30") {
      if (
        median3(l, w, t) <= normOf(norms, "NARROW_MAX_SECTION") &&
        maxDim <= normOf(norms, "NARROW_MAX_LEN")
      ) {
        return "B";
      }
    }

    if (maxDim >= normOf(norms, "TIER_A_MIN_LEN")) return "A";
    return "B";
  }

  function solidRateCode(material, tier) {
    if (!material || !tier) return null;
    const mat = String(material).trim().toUpperCase();
    if (mat === "MERANTI") return "MERANTI";
    return `${mat}_${tier.replace("-CURVED", "C")}`;
  }

  function panelThickness(code) {
    if (!code) return null;
    const sep = code.indexOf("-", 4);
    if (sep < 0) return null;
    const n = Number(code.slice(4, sep));
    return Number.isFinite(n) ? n : null;
  }

  function piecesPerSheet(l, w, norms) {
    const kerf = normOf(norms, "SHEET_KERF");
    const sheetL = normOf(norms, "SHEET_L");
    const sheetW = normOf(norms, "SHEET_W");
    const lp = l + kerf;
    const wp = w + kerf;
    return Math.max(
      Math.trunc(sheetL / lp) * Math.trunc(sheetW / wp),
      Math.trunc(sheetL / wp) * Math.trunc(sheetW / lp)
    );
  }

  function sheetsCharged(sheets, whole, waste, norms) {
    return waste > normOf(norms, "WASTE_REUSE_MIN")
      ? sheets * (1 + normOf(norms, "OFFCUT_HANDLING"))
      : whole;
  }

  function sheetsForOversizePanel(l, w, norms) {
    const sheetL = normOf(norms, "SHEET_L");
    const sheetW = normOf(norms, "SHEET_W");
    const optionA = Math.ceil(l / sheetL) * Math.ceil(w / sheetW);
    const optionB = Math.ceil(l / sheetW) * Math.ceil(w / sheetL);
    const sheets = Math.min(optionA, optionB);
    return { sheets, joints: sheets - 1 };
  }

  function computeSolid(line, rates, norms, version, lineNo) {
    const qty = line.qty ?? 1;
    const tier = autoTier(line, norms, version);
    const hasDims = filled(line.l) && filled(line.w) && filled(line.t);

    const checkMsg = !filled(line.l) ? ""
      : !filled(line.material) ? "material?"
      : !filled(line.exposed) ? "exposed Y/N?"
      : !filled(line.qty) ? "qty?"
      : "OK";

    const result = {
      line_no: lineNo,
      material: line.material ?? null,
      component: line.component ?? null,
      l: line.l ?? null,
      w: line.w ?? null,
      t: line.t ?? null,
      qty,
      exposed: line.exposed ?? "Y",
      curved: line.curved ?? "N",
      vol_m3: hasDims ? ((line.l * line.w * line.t) / 1e9) * qty : null,
      face_m2: filled(line.l) && filled(line.w) ? ((line.l * line.w) / 1e6) * qty : null,
      auto_tier: tier,
      tier,
      rate_code: solidRateCode(line.material, tier),
      rate_value: null,
      cost: null,
      worked_outside: Boolean(line.worked_outside),
      check: checkMsg,
      extra_fields: line.extra_fields || {}
    };

    if (result.rate_code) {
      const rate = rates[result.rate_code];
      if (rate === undefined) {
        if (result.check === "OK") result.check = "rate?";
      } else {
        const labCarp = rates.LAB_CARP || 0;
        const effectiveRate = line.worked_outside ? (rate - labCarp) : rate;
        result.rate_value = effectiveRate;
        if (result.vol_m3 !== null) {
          result.cost = result.vol_m3 * effectiveRate;
        }
      }
    }
    return result;
  }

  function computePanel(line, rates, norms, lineNo) {
    const qty = line.qty ?? 1;
    const hasSize = filled(line.l) && filled(line.w);
    const manual = line.sheets_manual;

    const result = {
      line_no: lineNo,
      panel_type: line.panel_type ?? null,
      component: line.component ?? null,
      l: line.l ?? null,
      w: line.w ?? null,
      t: line.t ?? null,
      qty,
      exposed_faces: line.exposed_faces ?? 1,
      vol_m3: null,
      face_m2: null,
      pieces_per_sheet: null,
      sheets: null,
      sheets_whole: null,
      waste: null,
      sheets_charged: null,
      rate_code: line.panel_type ?? null,
      rate_value: null,
      joints: null,
      joint_cost: null,
      cost: null,
      check: "",
      extra_fields: line.extra_fields || {}
    };

    if (hasSize) {
      const l = line.l;
      const w = line.w;
      result.face_m2 = (l * w / 1e6) * qty;
      if (filled(line.t)) {
        result.vol_m3 = (l * w * line.t / 1e9) * qty;
      }

      const n = piecesPerSheet(l, w, norms);
      result.pieces_per_sheet = n;

      if (n > 0) {
        const sheets = qty / n;
        const whole = Math.ceil(sheets);
        const waste = 1 - (qty * l * w) / (whole * normOf(norms, "SHEET_L") * normOf(norms, "SHEET_W"));
        result.sheets = sheets;
        result.sheets_whole = whole;
        result.waste = waste;
        result.sheets_charged = sheetsCharged(sheets, whole, waste, norms);
      } else {
        const { sheets, joints } = sheetsForOversizePanel(l, w, norms);
        result.sheets = sheets * qty;
        result.sheets_whole = sheets * qty;
        result.waste = 0;
        result.sheets_charged = sheets * qty;
        result.joints = joints * qty;
      }

      if (!line.panel_type) {
        result.check = "panel type?";
      } else if (panelThickness(line.panel_type) !== (line.t ?? null)) {
        result.check = "T must match panel type";
      } else if (line.exposed_faces === undefined || line.exposed_faces === null) {
        result.check = "exposed faces?";
      } else {
        result.check = "OK";
      }
    }

    if (manual !== undefined && manual !== null) {
      result.sheets = manual;
      result.sheets_whole = Math.ceil(manual);
      result.sheets_charged = manual;
      if (!hasSize) {
        result.check = line.panel_type ? "OK" : "panel type?";
      }
    }

    if (line.panel_type) {
      const rate = rates[line.panel_type];
      if (rate === undefined) {
        result.rate_value = null;
        if (result.check === "OK") result.check = "rate?";
      } else {
        result.rate_value = rate;
        if (result.sheets_charged !== null) {
          result.cost = result.sheets_charged * rate;
        }
      }
    }

    if (result.joints !== null && result.joints > 0) {
      const jointRate = rates.PANEL_JOINT;
      if (jointRate === undefined) {
        if (result.check === "OK") result.check = "joint rate?";
      } else {
        result.joint_cost = result.joints * jointRate;
        result.cost = (result.cost ?? 0) + result.joint_cost;
      }
    }

    return result;
  }

  function allFacesM2(l, w, t, qty) {
    return (2 * (l * w + l * t + w * t) / 1e6) * qty;
  }

  function finishingM2(solid, panels, norms) {
    const exposedOnly = normOf(norms, "FIN_EXPOSED_ONLY") === 1;
    let m2 = 0;

    for (const line of solid) {
      if (line.exposed !== "Y") continue;
      const { l, w, t } = line;
      if (!filled(l) || !filled(w)) continue;
      const qty = line.qty ?? 1;
      if (exposedOnly) {
        m2 += (l * w / 1e6) * qty;
      } else {
        if (!filled(t)) continue;
        m2 += allFacesM2(l, w, t, qty);
      }
    }

    for (const line of panels) {
      const { l, w, t } = line;
      if (!filled(l) || !filled(w)) continue;
      const qty = line.qty ?? 1;
      const faces = line.exposed_faces ?? 0;
      if (exposedOnly) {
        m2 += (l * w / 1e6) * qty * faces;
      } else {
        if (faces <= 0) continue;
        if (!filled(t)) continue;
        m2 += allFacesM2(l, w, t, qty);
      }
    }
    return m2;
  }

  function finishingCost(m2, rates) {
    const fin_mat = m2 * rateOf(rates, "FIN_MAT");
    const sand_mat = m2 * rateOf(rates, "SAND_MAT");
    const sand_lab = m2 * rateOf(rates, "SAND_LAB");
    const fin_lab = m2 * rateOf(rates, "FIN_LAB");
    return {
      fin_mat,
      sand_mat,
      sand_lab,
      fin_lab,
      total: fin_mat + sand_mat + sand_lab + fin_lab
    };
  }

  function computePacking(header, boxes, norms) {
    const add = normOf(norms, "CARTON_ADD");
    const rows = [];

    (boxes || []).forEach((box, idx) => {
      if (!filled(box.l)) return;
      const qty = filled(box.qty) ? box.qty : 1;
      const cl = box.l + add;
      const cw = (box.w ?? 0) + add;
      const ch = (box.h ?? 0) + add;
      rows.push({
        box_no: box.box_no ?? idx + 1,
        contents: box.contents ?? null,
        qty,
        carton_l: cl,
        carton_w: cw,
        carton_h: ch,
        m2: (2 * (cl * cw + cl * ch + cw * ch) / 1e6) * qty,
        m3: (cl * cw * ch / 1e9) * qty,
      });
    });

    const firstRowFilled = boxes && boxes.length > 0 && filled(boxes[0].l);
    if (!firstRowFilled) {
      const l = (header.overall_l ?? 0) + add;
      const w = (header.overall_w ?? 0) + add;
      const h = (header.overall_h ?? 0) + add;
      const hasOverall = filled(header.overall_l);
      return {
        rows: [],
        cartons: 1,
        m2: hasOverall ? (2 * (l * w + l * h + w * h) / 1e6) : 0,
        m3: hasOverall ? (l * w * h / 1e9) : 0,
        from_overall: true
      };
    }

    return {
      rows,
      cartons: rows.reduce((s, r) => s + r.qty, 0),
      m2: rows.reduce((s, r) => s + r.m2, 0),
      m3: rows.reduce((s, r) => s + r.m3, 0),
      from_overall: false
    };
  }

  function packingCost(agg, rates, norms) {
    const board = agg.m2 < normOf(norms, "CARTON_MIN_M2")
      ? rateOf(rates, "GRP_A") * agg.cartons
      : agg.m2 * rateOf(rates, "CARTON_M2") * (1 + (agg.cartons > 1 ? normOf(norms, "KD_PACK_FACTOR") : 0));
    return board + agg.m3 * rateOf(rates, "PACK_LAB");
  }

  function costItem(input, rates, norms, options = {}) {
    const version = options.tierRuleVersion ?? "2026-09-30";
    const solidLines = input.solid ?? [];
    const panelLines = input.panels ?? [];
    const hardwareLines = input.hardware ?? [];
    const customLines = input.custom ?? [];
    const boxLines = input.boxes ?? [];

    const solid = solidLines.map((l, i) => computeSolid(l, rates, norms, version, l.line_no ?? i + 1));
    const panels = panelLines.map((l, i) => computePanel(l, rates, norms, l.line_no ?? i + 1));

    const hardware = hardwareLines.map((l, i) => {
      const qty = l.qty ?? 1;
      const price = filled(l.unit_price) ? Number(l.unit_price) : null;
      return {
        line_no: l.line_no ?? i + 1,
        item_code: l.item_code ?? null,
        description: l.description ?? null,
        qty,
        unit_price: price,
        cost: price !== null ? qty * price : null,
        extra_fields: l.extra_fields || {}
      };
    });

    const custom = customLines.map((l, i) => {
      const qty = l.qty ?? 1;
      const price = filled(l.unit_price) ? Number(l.unit_price) : (filled(l.total_cost) ? Number(l.total_cost) / qty : null);
      const total = price !== null ? qty * price : (filled(l.total_cost) ? Number(l.total_cost) : null);
      return {
        line_no: l.line_no ?? i + 1,
        category: l.category ?? "Custom",
        description: l.description ?? null,
        qty,
        unit_price: price,
        cost: total,
        allocation: l.allocation ?? "DIRECT",
        extra_fields: l.extra_fields || {}
      };
    });

    const packingAgg = computePacking(input.header || {}, boxLines, norms);

    const solid_m3 = solid.reduce((s, r) => s + (r.vol_m3 ?? 0), 0);
    const panel_sheets = panels.reduce((s, r) => s + (r.sheets ?? 0), 0);
    const finishing_m2 = finishingM2(solidLines, panelLines, norms);
    const cartons = packingAgg.cartons;
    const carton_m3 = packingAgg.m3;
    const carton_m2 = packingAgg.m2;

    const timber = solid.reduce((s, r) => s + (r.cost ?? 0), 0);
    const labCarpRate = rateOf(rates, "LAB_CARP");
    const carpentry_labour = solidLines.reduce(
      (s, l, i) => s + (l.worked_outside ? 0 : (solid[i]?.vol_m3 ?? 0)),
      0
    ) * labCarpRate;
    const timber_wood_processing = timber - carpentry_labour;

    const fasteners = solid_m3 * rateOf(rates, "FASTENERS");
    const panels_cost = panels.reduce((s, r) => s + (r.cost ?? 0), 0);
    const fin = finishingCost(finishing_m2, rates);
    const hardware_cost = hardware.reduce((s, r) => s + (r.cost ?? 0), 0);
    const custom_cost = custom.reduce((s, r) => s + (r.cost ?? 0), 0);
    const packing = packingCost(packingAgg, rates, norms);

    const direct = timber + fasteners + panels_cost + fin.total + hardware_cost + custom_cost + packing;
    const misc = direct * rateOf(rates, "MISC_PCT");
    const overhead = (direct + misc) * rateOf(rates, "OH_PCT");
    const unit_cost = direct + misc + overhead;
    const project_qty = input.header ? (input.header.project_qty ?? 1) : 1;
    const project_total = project_qty * unit_cost;

    // Detect anomalies / missing data
    const missing_fields = [];
    hardware.forEach((h) => {
      if (h.cost === null) missing_fields.push(`Hardware '${h.description || h.item_code}' unit price missing`);
    });
    custom.forEach((c) => {
      if (c.cost === null) missing_fields.push(`Custom part '${c.description}' cost missing`);
    });

    const unusual_dimensions = [];
    solidLines.forEach((l) => {
      if (l.l > 3000 || (l.w > 200 && l.t > 80)) {
        unusual_dimensions.push(`Solid part '${l.component}' length ${l.l}mm or cross-section ${l.w}x${l.t}mm is unusual`);
      }
    });
    panelLines.forEach((p) => {
      if (p.l > 2440 || p.w > 1220) {
        unusual_dimensions.push(`Panel '${p.component}' ${p.l}x${p.w}mm exceeds standard sheet size (requires joining)`);
      }
    });

    const checks = [...solid, ...panels]
      .map((r) => r.check)
      .filter((c) => c !== "" && c !== "OK");

    const partial = missing_fields.length > 0;

    return {
      item_code: input.header ? input.header.item_code : "UNKNOWN",
      tier_rule_version: version,
      solid,
      panels,
      hardware,
      custom,
      boxes: packingAgg.rows,
      solid_m3,
      panel_sheets,
      finishing_m2,
      cartons,
      carton_m3,
      carton_m2,
      timber,
      timber_wood_processing,
      carpentry_labour,
      fasteners,
      panels_cost,
      fin_mat: fin.fin_mat,
      sand_mat: fin.sand_mat,
      sand_lab: fin.sand_lab,
      fin_lab: fin.fin_lab,
      finishing: fin.total,
      hardware_cost,
      custom_cost,
      packing,
      direct,
      misc,
      overhead,
      unit_cost,
      project_total,
      checks,
      missing_fields,
      unusual_dimensions,
      partial,
      ok: checks.length === 0 && !partial
    };
  }

  return {
    ENGINE_VERSION,
    PANEL_THICKNESSES,
    PANEL_FACES,
    deriveRates,
    derivePanelRates,
    autoTier,
    median3,
    solidRateCode,
    panelThickness,
    piecesPerSheet,
    sheetsCharged,
    sheetsForOversizePanel,
    finishingM2,
    finishingCost,
    computePacking,
    packingCost,
    costItem
  };
}));
