<script lang="ts">
  import { onMount } from "svelte";
  import * as culori from "culori";
  import type { Variation } from "./colors";
  import { varyColor } from "./colors";
  import PaletteBrowser from "./PaletteBrowser.svelte";
  import LightSelector from "./LightSelector.svelte";
  import ColorSelector from "./ColorSelector.svelte";
  import VariationConfig from "./VariationConfig.svelte";
  import Section from "./Section.svelte";
  import {
    defaultCVariation,
    defaultHVariation,
    defaultLVariation,
    version,
  } from "./consts";
  import { delay, getColorRGBs } from "./helpers";
  import * as apply from "./apply";
  import cx from "clsx";
  import type { Palette } from "./palettes/types";
  import type { Hass } from "./types/ha";
  import type { LightState, SetLight } from "./types/app";
  import { getColors, getEnabledLights, persistState } from "./state";
  import { isValidHass } from "./api/helpers";
  import EmbeddedHALightAPI from "./api/embedded-ha";
  import ExternalHALightAPI from "./api/external-ha";
  import BrightnessControls from "./BrightnessControls.svelte";

  export let hass: Hass | null = null;
  const getHass = () => {
    if (isValidHass(hass)) return hass;
    throw new Error("Invalid hass");
  };
  const darkMode = isValidHass(hass) ? hass.themes.darkMode : false;
  const lightAPI = isValidHass(hass)
    ? new EmbeddedHALightAPI(getHass)
    : new ExternalHALightAPI();

  let enabledLights: string[] = getEnabledLights();
  let colors: string[] = getColors();

  let brightnessMode: "set" | "keep" | "static" = "set";
  let brightnessMultiplier = 1;
  let lights: LightState[] = [];
  let lVariation: Variation = { ...defaultLVariation };
  let cVariation: Variation = { ...defaultCVariation };
  let hVariation: Variation = { ...defaultHVariation };

  async function reloadLights() {
    lights = await lightAPI.getLightStates();
  }

  async function applyColors(variation: boolean) {
    const rgbs = getColorRGBs(colors);
    if (!rgbs.length) return;
    try {
      persistState({ enabledLights, colors });
    } catch (e) {
      // probably out of quota
    }
    const result = await apply.applyColors({
      api: lightAPI,
      rgbs,
      entityIds: enabledLights,
      lVariation: variation ? lVariation : null,
      cVariation: variation ? cVariation : null,
      hVariation: variation ? hVariation : null,
      brightnessMode,
      brightnessMultiplier,
    });
    await Promise.all(result.promises);
    await delay(500);
    await reloadLights();
  }

  function applyVariation(c: readonly string[], index?: number) {
    const rgbs = getColorRGBs(c);
    const varied = rgbs.map((rgb, i) =>
      index === undefined || i === index
        ? varyColor(rgb, lVariation, cVariation, hVariation)
        : rgb,
    );
    const variedHexes = varied.map((rgb) => culori.formatHex(culori.rgb(rgb)));
    colors = variedHexes;
  }

  async function setLight(e: CustomEvent<SetLight>) {
    const { entityId, brightness, color, state } = e.detail;
    if (brightness !== undefined) {
      await lightAPI.setLightBrightness(entityId, brightness);
    }
    if (color !== undefined) {
      await lightAPI.setLightColor(entityId, color);
    }
    if (state !== undefined) {
      await lightAPI.setLightState(entityId, state);
    }
    await delay(500);
    await reloadLights();
  }

  function handleSelectPalette({
    detail: { palette, append },
  }: {
    detail: { palette: Palette; append: boolean };
  }) {
    if (append) {
      colors = [...colors, ...palette.colors];
    } else {
      colors = [...palette.colors];
    }
  }

  onMount(reloadLights);
</script>

<main class={cx(darkMode ? "dark" : false)}>
  <div class="toolbar flex py-1 gap-1">
    <button
      class="btn btn-success basis-2 flex-auto"
      on:click={() => applyColors(false)}
      disabled={colors.length === 0}
      >Apply
    </button>
    <button
      class="btn btn-success basis-1 flex-auto"
      on:click={() => applyColors(true)}
      disabled={colors.length === 0}
      >Apply with variation
    </button>
  </div>
  <div class="p-2 flex gap-1 justify-between">
    <BrightnessControls bind:brightnessMode bind:brightnessMultiplier />
    <div class="opacity-50">
      Illuminatrix {version}
    </div>
  </div>
  <div class={"flex flex-1 p-1 gap-1 flex-col md:flex-row min-h-[20em]"}>
    <Section title="Lights">
      <LightSelector
        {lights}
        bind:enabledLights
        on:set={setLight}
        on:reload={reloadLights}
      />
    </Section>
    <Section title="Colors">
      <ColorSelector
        bind:colors
        on:applyVariation={(e) =>
          applyVariation(e.detail.colors, e.detail.index)}
      />
    </Section>
    <Section title="Palettes">
      <PaletteBrowser on:select={handleSelectPalette} />
    </Section>
    <Section title="Variation" open={false}>
      <VariationConfig bind:lVariation bind:cVariation bind:hVariation />
    </Section>
  </div>
</main>
