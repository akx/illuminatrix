import type { Hass } from "../types/ha";
import type { LightAPI } from "./base";
import EmbeddedHALightAPI from "./embedded-ha";
import ExternalHALightAPI from "./external-ha";

export function getAPI(hass: Hass | null): LightAPI {
  if (hass?.states && hass?.callService) {
    return new EmbeddedHALightAPI(hass);
  }
  return new ExternalHALightAPI();
}
