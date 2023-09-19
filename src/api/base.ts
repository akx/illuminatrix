import type { LightState, Rgb } from "../types/app";

export interface LightAPI {
  getLightStates(): Promise<LightState[]>;

  setLightBrightness(entityId: string, value: number): Promise<void>;

  setLightColor(
    entityId: string,
    rgb: string | Rgb,
    brightness?: number,
  ): Promise<void>;

  setLightState(entityId: string, state: boolean): Promise<void>;
}
