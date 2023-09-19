import {
  BaseHALightAPI,
  haLightStateToAppLightState,
  isHALightState,
} from "./base-ha";

function makeHeaders(extra: Record<string, string> = {}) {
  const token = import.meta.env?.VITE_HA_API_TOKEN;
  if (!token) {
    throw new Error("Missing VITE_HA_API_TOKEN");
  }
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

function makeUrl(url: string) {
  const baseUrl = import.meta.env?.VITE_HA_API_URL;
  if (!baseUrl) {
    throw new Error("Missing VITE_HA_API_URL");
  }
  return new URL(url, baseUrl);
}

async function getHA<T = any>(url: string): Promise<T> {
  const res = await fetch(makeUrl(url), {
    headers: makeHeaders(),
  });
  return res.json();
}

async function postHA(url: string, payload: any): Promise<void> {
  await fetch(makeUrl(url), {
    method: "POST",
    headers: makeHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });
}

export default class ExternalHALightAPI extends BaseHALightAPI {
  callLightService(service: string, payload: Record<string, any>) {
    return postHA(`services/light/${service}`, payload);
  }

  async getLightStates() {
    return [...(await getHA("states"))]
      .filter(isHALightState)
      .map((hals) => haLightStateToAppLightState(hals));
  }
}
