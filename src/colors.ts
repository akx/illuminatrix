import * as culori from "culori";

export interface Variation {
  variation: number;
  minimum: number;
  maximum: number;
}

function birand(x) {
  return Math.random() * x * (Math.random() > 0.5 ? 1 : -1);
}

function applyVariation(
  value: number,
  { maximum, minimum, variation }: Variation,
): number {
  value = value + birand(variation);
  if (value < minimum) value = minimum;
  if (value > maximum) value = maximum;
  return value;
}

export function varyColor(
  color: culori.Rgb,
  lVariation: Variation | null,
  cVariation: Variation | null,
  hVariation: Variation | null,
): culori.Rgb {
  const oklch = culori.oklch(color);
  if (!oklch) throw new Error("Invalid color");
  if (lVariation) oklch.l = applyVariation(oklch.l, lVariation);
  if (cVariation) oklch.c = applyVariation(oklch.c, cVariation);
  if (hVariation) oklch.h = applyVariation(oklch.h / 360, hVariation) * 360;
  return culori.clampRgb(culori.rgb(oklch));
}
