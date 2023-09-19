const defaultColors = ["#ffc030", "#c05a10"];

function getStringArray(key: string) {
  const dat = JSON.parse(localStorage.getItem(key) || "[]");
  if (Array.isArray(dat)) {
    return dat.map((x) => String(x));
  }
  throw new Error("Not an array");
}

const ENABLED_LIGHTS_KEY = "illuminatrix.enabledLights";
const COLORS_KEY = "illuminatrix.colors";

export function getEnabledLights(): string[] {
  try {
    return getStringArray(ENABLED_LIGHTS_KEY);
  } catch (e) {
    console.warn("Failed to parse enabledLights from localStorage", e);
    return [];
  }
}

export function getColors(): string[] {
  try {
    return getStringArray(COLORS_KEY);
  } catch (e) {
    console.warn("Failed to parse colors from localStorage", e);
    return defaultColors;
  }
}

interface PersistStateParams {
  enabledLights: string[];
  colors: string[];
}

export function persistState({ enabledLights, colors }: PersistStateParams) {
  localStorage.setItem(ENABLED_LIGHTS_KEY, JSON.stringify(enabledLights));
  localStorage.setItem(COLORS_KEY, JSON.stringify(colors));
}
