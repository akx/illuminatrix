export interface HALightState {
  entity_id: `light.${string}`;
  state: StateState;
  attributes: Attributes;
  last_changed: Date;
  last_updated: Date;
  context: Context;
}

export interface Attributes {
  brightness?: number;
  color?: Color;
  color_mode?: ColorMode;
  color_temp?: number;
  color_temp_kelvin?: number;
  color_temp_startup?: number;
  effect_list?: string[];
  entity_id?: string[];
  friendly_name: string;
  hs_color?: number[];
  icon?: string;
  linkquality?: number;
  max_color_temp_kelvin?: number;
  max_mireds?: number;
  min_color_temp_kelvin?: number;
  min_mireds?: number;
  power_on_behavior?: null | string;
  restored?: boolean;
  rgb_color?: [number, number, number];
  supported_color_modes: ColorMode[];
  supported_features: number;
  update?: Update;
  update_available?: boolean;
  xy_color?: number[];
}

export interface Color {
  h?: number;
  hue?: number;
  s?: number;
  saturation?: number;
  x: number;
  y: number;
}

export enum ColorMode {
  ColorTemp = "color_temp",
  Onoff = "onoff",
  Rgbw = "rgbw",
  Rgbww = "rgbww",
  Xy = "xy",
}

export interface Update {
  installed_version: number;
  latest_version: number;
  state: UpdateState;
}

export enum UpdateState {
  Idle = "idle",
}

export interface Context {
  id: string;
  parent_id: null;
  user_id: null;
}

export enum StateState {
  Off = "off",
  On = "on",
  Unavailable = "unavailable",
}

export interface Entity {
  entity_id: string;
  area_id?: string | null;
  device_id?: string | null;
}

export interface Device {
  id: string; // of course it's not `device_id`
  area_id: string | null;
}

export interface Area {
  area_id: string;
  name: string;
}

// Not perfectly static, really, but good enough for us...
export interface HassStaticRegistry {
  entities: Record<string, Entity>;
  devices: Record<string, Device>;
  areas: Record<string, Area>;
}

export interface Hass extends HassStaticRegistry {
  callService(domain: string, service: string, data: any): Promise<void>;

  states: Record<string, Record<string, any>>;

  themes: { darkMode: boolean };
}
