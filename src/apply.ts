import { clampInteger, randomBag } from "./helpers";
import type { Variation } from "./colors";
import { varyColor } from "./colors";
import * as culori from "culori";
import type { LightAPI } from "./api/base";
import type { BrightnessMode } from "./types";

interface ApplyColorsParams {
  api: LightAPI;
  rgbs: readonly culori.Rgb[];
  entityIds: readonly string[];
  lVariation: Variation | null;
  cVariation: Variation | null;
  hVariation: Variation | null;
  brightnessMode?: BrightnessMode;
  brightnessMultiplier?: number;
}

interface ApplyColorsResult {
  promises: Promise<unknown>[];
  appliedColors: Record<string, culori.Rgb>;
}

export async function applyColors({
  api,
  rgbs,
  entityIds,
  lVariation,
  cVariation,
  hVariation,
  brightnessMode = "keep",
  brightnessMultiplier = 1,
}: ApplyColorsParams): Promise<ApplyColorsResult> {
  const appliedColors: Record<string, culori.Rgb> = {};
  const promises = [];
  const colorBag = randomBag(rgbs);
  for (const entity of entityIds) {
    const rgb = colorBag.next().value;
    const varied = varyColor(rgb, lVariation, cVariation, hVariation);
    appliedColors[entity] = varied;
    let brightness: number | undefined;
    switch (brightnessMode) {
      case "keep":
        break;
      case "set":
        brightness = clampInteger(
          culori.wcagLuminance(varied) * brightnessMultiplier * 255,
          0,
          255,
        );
        break;
      case "static":
        brightness = clampInteger(brightnessMultiplier * 255, 0, 255);
        break;
    }
    promises.push(api.setLightColor(entity, varied, brightness));
  }
  return { promises, appliedColors };
}
