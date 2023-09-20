import type { Variation } from "./colors";

export const zeroVariation: Variation = {
  variation: 0,
  minimum: 0,
  maximum: 1,
};

export const defaultLVariation: Variation = {
  variation: 0.05,
  minimum: 0,
  maximum: 1,
};
export const defaultCVariation: Variation = {
  variation: 0.03,
  minimum: 0,
  maximum: 1,
};
export const defaultHVariation: Variation = {
  variation: 0.01,
  minimum: 0,
  maximum: 1,
};
export const standaloneRootSelector = "#illuminatrix-root";
export const version = String(
  import.meta.env?.VITE_ILLUMINATRIX_VERSION ?? "unknown",
);
