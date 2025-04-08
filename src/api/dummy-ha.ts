import {
  BaseHALightAPI,
  haLightStateToAppLightState,
  isHALightState,
} from "./base-ha";
import type { Hass } from "../types/ha";

export default class DummyHALightAPI extends BaseHALightAPI {
  async callLightService(service: string, payload: Record<string, any>) {
    console.log("DummyHALightAPI: callLightService", service, payload);
  }

  async getLightStates() {
    return [];
  }
}
