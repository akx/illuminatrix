import {
  BaseHALightAPI,
  haLightStateToAppLightState,
  isHALightState,
} from "./base-ha";
import type { Hass } from "../types/ha";

export default class EmbeddedHALightAPI extends BaseHALightAPI {
  private hass: Hass;

  constructor(hass: Hass) {
    super();
    this.hass = hass;
  }

  callLightService(service: string, payload: Record<string, any>) {
    return this.hass.callService("light", service, payload);
  }

  async getLightStates() {
    const { entities, devices, areas } = this.hass;
    const stateMaps = { entities, devices, areas };
    return Object.values(this.hass.states)
      .filter(isHALightState)
      .map((hals) => haLightStateToAppLightState(hals, stateMaps));
  }
}
