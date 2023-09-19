import type { LightAPI } from "./base";
import { clampInteger, getColorRGBs, rgbTo8BitRGBTriple } from "../helpers";
import type { Area, HALightState, HassStaticRegistry } from "../types/ha";
import type { Rgb, LightState } from "../types/app";

export abstract class BaseHALightAPI implements LightAPI {
  abstract callLightService(
    service: string,
    payload: Record<string, any>,
  ): Promise<void>;

  abstract getLightStates();

  public setLightBrightness(entityId: string, value: number) {
    return this.callLightService(`turn_on`, {
      entity_id: entityId,
      brightness: clampInteger(value, 0, 255),
    });
  }

  public setLightColor(
    entityId: string,
    rgbx: string | Rgb,
    brightness?: number,
  ) {
    const [rgb] = typeof rgbx === "string" ? getColorRGBs([rgbx]) : [rgbx];
    const payload: Record<string, any> = {
      entity_id: entityId,
      rgb_color: rgbTo8BitRGBTriple(rgb),
    };
    if (brightness) {
      payload.brightness = clampInteger(brightness, 0, 255);
    }
    return this.callLightService(`turn_on`, payload);
  }

  public setLightState(entityId: string, state: boolean) {
    return this.callLightService(`turn_${state ? "on" : "off"}`, {
      entity_id: entityId,
    });
  }
}

export function isHALightState(obj: any): obj is HALightState {
  return (
    obj &&
    typeof obj === "object" &&
    obj.entity_id &&
    obj.state &&
    obj.entity_id.startsWith("light.")
  );
}

const NO_STATE_MAPS = { entities: {}, devices: {}, areas: {} };

function getAreaFromState(
  state: HALightState,
  { areas, devices, entities }: HassStaticRegistry,
): Area | undefined {
  const entity = entities[state.entity_id];
  if (entity) {
    if (entity.area_id) {
      const entityArea = areas[entity.area_id];
      if (entityArea) {
        return entityArea;
      }
    }
    const device = devices[entity.device_id];
    if (device && device.area_id) {
      const deviceArea = areas[device.area_id];
      if (deviceArea) {
        return deviceArea;
      }
    }
  }
  return undefined;
}

export function haLightStateToAppLightState(
  hals: HALightState,
  stateMaps: HassStaticRegistry = NO_STATE_MAPS,
): LightState {
  const area = getAreaFromState(hals, stateMaps);
  return {
    id: hals.entity_id,
    friendlyName: hals.attributes.friendly_name,
    state: hals.state,
    brightness: hals.attributes.brightness,
    rgbColor: hals.attributes.rgb_color,
    areaId: area?.area_id ?? null,
    areaFriendlyName: area?.name ?? null,
  };
}
