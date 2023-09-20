import {
  BaseHALightAPI,
  haLightStateToAppLightState,
  isHALightState,
} from "./base-ha";
import type { Hass } from "../types/ha";

export default class EmbeddedHALightAPI extends BaseHALightAPI {
  private _getHass: () => Hass;

  // We need a trampoline function to get the newest `hass` object
  // that the HA UI passes down to our panel.
  constructor(getHass: () => Hass) {
    super();
    this._getHass = getHass;
  }

  private get hass() {
    return this._getHass();
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
