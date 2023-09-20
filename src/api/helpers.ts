import type { Hass } from "../types/ha";

export function isValidHass(hass: any): hass is Hass {
  return hass?.states && hass?.callService;
}
