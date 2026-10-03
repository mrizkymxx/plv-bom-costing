export const ENGINE_VERSION = "0.0.1";

export * from "./types";
export { deriveRates, derivePanelRates, PANEL_FACES, PANEL_THICKNESSES } from "./derive";
export type { RateInputs, PanelRateInputs } from "./derive";
export { normOf, rateOf } from "./lookup";
export { autoTier, median3, solidRateCode } from "./tier";
export { computePanel, panelThickness, piecesPerSheet, sheetsCharged } from "./panel";
export { finishingCost, finishingM2 } from "./finishing";
export type { FinishingCost } from "./finishing";
export { computePacking, packingCost } from "./packing";
export { costItem } from "./cost";
export {
  REFERENCE_ITEMS,
  REFERENCE_NORMS,
  REFERENCE_PANEL_INPUTS,
  REFERENCE_RATE_INPUTS,
} from "./reference";
export type { ReferenceItem } from "./reference";
