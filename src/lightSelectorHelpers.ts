import type { LightState } from "./types/app";
import orderBy from "lodash-es/orderBy";
import groupBy from "lodash-es/groupBy";

export function sortLights(lights: readonly LightState[]): LightState[] {
  return orderBy(
    lights,
    [
      (l: LightState) => l.isGroup,
      (l: LightState) => ["unavailable", "off", "on"].indexOf(l.state),
      (l: LightState) => l.friendlyName ?? l.id,
    ],
    ["asc", "desc", "asc"],
  );
}

type AllEnabledState = "on" | "off" | "some";

interface LightGroup {
  name: string;
  lights: LightState[];
  allEnabledState: AllEnabledState;
  allUnavailable: boolean;
}

function getAllEnabledState(
  lights: readonly LightState[],
  enabledLights: string[],
): AllEnabledState {
  let allState: AllEnabledState | undefined = undefined;
  for (const light of lights) {
    const enabled = enabledLights.includes(light.id) ? "on" : "off";
    if (allState === undefined) {
      allState = enabled;
    } else if (allState !== enabled) {
      return "some";
    }
  }
  if (allState === undefined) {
    return "off"; // Didn't have any lights, I guess
  }
  return allState;
}

export function groupLights(
  lights: readonly LightState[],
  enabledLights: string[],
): LightGroup[] {
  const rawGroups = groupBy(
    lights,
    (l: LightState) => l.areaFriendlyName ?? "\uFEFFOther",
  );
  const groups: LightGroup[] = [];
  for (const name of Object.keys(rawGroups).sort()) {
    const lights = sortLights(rawGroups[name] ?? []);
    if (!lights.length) continue;
    const group: LightGroup = {
      name,
      lights,
      allEnabledState: getAllEnabledState(lights, enabledLights),
      allUnavailable: lights.every(
        (l: LightState) => l.state === "unavailable",
      ),
    };
    groups.push(group);
  }
  return groups;
}
