export interface SetLight {
  entityId: string;
  color?: string;
  brightness?: number;
  state?: boolean;
}

export interface Rgb {
  mode: "rgb";
  r: number;
  g: number;
  b: number;
  alpha?: number;
}

export interface LightState {
  id: string;
  state: "off" | "on" | "unavailable";
  friendlyName: string;
  brightness?: number;
  rgbColor?: [number, number, number];
  areaId: string | null;
  areaFriendlyName: string | null;
  isGroup?: boolean;
}
