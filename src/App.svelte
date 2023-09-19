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
  } from "./consts";
  import { delay, getColorRGBs } from "./helpers";
  import * as apply from "./apply";
  import cx from "clsx";
  import type { Palette } from "./palettes/types";
  import type { Hass } from "./types/ha";
  import type { LightState, SetLight } from "./types/app";
  import { getColors, getEnabledLights, persistState } from "./state";
  import { getAPI, isValidHass } from "./api/helpers";

  export let hass: Hass | null = null;
  const darkMode = isValidHass(hass) ? hass.themes.darkMode : false;
  const lightAPI = getAPI(hass);

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
  <div class="p-2 text-center">
    Brightness:
    <input
      type="range"
      min="0"
      max="3"
      step="0.01"
      bind:value={brightnessMultiplier}
      disabled={brightnessMode === "keep"}
    />
    {Math.round(brightnessMultiplier * 100)}%
    <label class="label inline cursor-pointer">
      <input
        class="radio radio-sm"
        type="radio"
        bind:group={brightnessMode}
        value="keep"
      /> Keep
    </label>
    <label class="label inline cursor-pointer">
      <input
        class="radio radio-sm"
        type="radio"
        bind:group={brightnessMode}
        value="set"
      /> From color
    </label>
    <label class="label inline cursor-pointer">
      <input
        class="radio radio-sm"
        type="radio"
        bind:group={brightnessMode}
        value="static"
      /> Static
    </label>
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
