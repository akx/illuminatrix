import type { Hass } from "../types/ha";
import type { LightAPI } from "./base";
import EmbeddedHALightAPI from "./embedded-ha";
import ExternalHALightAPI from "./external-ha";

export function isValidHass(hass: any): hass is Hass {
  return hass?.states && hass?.callService;
}

export function getAPI(hass: Hass | null): LightAPI {
  if (isValidHass(hass)) {
    return new EmbeddedHALightAPI(hass);
  }
  return new ExternalHALightAPI();
}
