import {
  BaseHALightAPI,
  haLightStateToAppLightState,
  isHALightState,
} from "./base-ha";
import HassWebSocket from "./hass-ws";
import type { HassStaticRegistry } from "../types/ha";

import type { Area, Device, Entity } from "../types/ha";

interface HAResult {
  type: "result";
  id: number;
  success: boolean;
}

export interface HAStatesResult extends HAResult {
  result: any[];
}

export interface HADeviceRegistryResult extends HAResult {
  result: Device[];
}

export interface HAEntityRegistryResult extends HAResult {
  result: Entity[];
}

export interface HAAreaRegistryResult extends HAResult {
  result: Area[];
}

function getHomeAssistantApiToken() {
  const token = import.meta.env?.VITE_HA_API_TOKEN;
  if (!token) {
    throw new Error("Missing VITE_HA_API_TOKEN");
  }
  return token;
}

function getHomeAssistantApiUrl() {
  const baseUrl = import.meta.env?.VITE_HA_API_URL;
  if (!baseUrl) {
    throw new Error("Missing VITE_HA_API_URL");
  }
  return baseUrl;
}

async function getStaticRegistry(
  ws: HassWebSocket,
): Promise<HassStaticRegistry> {
  const devicePromise = ws.sendCommandAndWait<HADeviceRegistryResult>(
    "config/device_registry/list",
  );
  const entityPromise = ws.sendCommandAndWait<HAEntityRegistryResult>(
    "config/entity_registry/list",
  );
  const areaPromise = ws.sendCommandAndWait<HAAreaRegistryResult>(
    "config/area_registry/list",
  );
  const [{ result: devices }, { result: entities }, { result: areas }] =
    await Promise.all([devicePromise, entityPromise, areaPromise]);
  return {
    devices: Object.fromEntries(devices.map((d) => [d.id, d])),
    entities: Object.fromEntries(entities.map((e) => [e.entity_id, e])),
    areas: Object.fromEntries(areas.map((a) => [a.area_id, a])),
  };
}

export default class ExternalHALightAPI extends BaseHALightAPI {
  private _ws: HassWebSocket | null = null;
  private _registry: HassStaticRegistry | null = null;

  private onDisconnect = (ws: HassWebSocket) => {
    if (ws === this._ws) {
      this._ws = null;
      this._registry = null;
    }
  };

  private async getWs() {
    if (!this._ws) {
      const ws = new HassWebSocket();
      await ws.connect(getHomeAssistantApiUrl(), getHomeAssistantApiToken());
      this._ws = ws;
      ws.addDisconnectionCallback(this.onDisconnect);
    }
    return this._ws;
  }

  async callLightService(service: string, payload: Record<string, any>) {
    const ws = await this.getWs();
    await ws.sendCommandAndWait({
      type: "call_service",
      domain: "light",
      service,
      service_data: payload,
    });
  }

  async getLightStates() {
    const ws = await this.getWs();
    if (!this._registry) {
      this._registry = await getStaticRegistry(ws);
    }
    const statesResult = await ws.sendCommandAndWait<HAStatesResult>({
      type: "get_states",
    });
    return [...statesResult.result]
      .filter(isHALightState)
      .map((hals) => haLightStateToAppLightState(hals, this._registry));
  }
}
