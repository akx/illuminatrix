<script lang="ts">
  import VariationConfigRow from "./VariationConfigRow.svelte";
  import type { Variation } from "./colors";
  import {
    defaultCVariation,
    defaultHVariation,
    defaultLVariation,
    zeroVariation,
  } from "./consts";

  export let lVariation: Variation = { ...zeroVariation };
  export let cVariation: Variation = { ...zeroVariation };
  export let hVariation: Variation = { ...zeroVariation };

  function zeroAll() {
    lVariation = { ...zeroVariation };
    cVariation = { ...zeroVariation };
    hVariation = { ...zeroVariation };
  }

  function defaultAll() {
    lVariation = { ...defaultLVariation };
    cVariation = { ...defaultCVariation };
    hVariation = { ...defaultHVariation };
  }
</script>

<div class="pb-2">
  <button class="btn btn-outline" on:click={zeroAll}>Zero All</button>
  <button class="btn btn-outline" on:click={defaultAll}>Defaults</button>
</div>

<VariationConfigRow
  label="Lightness"
  bind:variation={lVariation.variation}
  bind:minimum={lVariation.minimum}
  bind:maximum={lVariation.maximum}
/>
<VariationConfigRow
  label="Chromaticity"
  bind:variation={cVariation.variation}
  bind:minimum={cVariation.minimum}
  bind:maximum={cVariation.maximum}
/>
<VariationConfigRow
  label="Hue"
  bind:variation={hVariation.variation}
  bind:minimum={hVariation.minimum}
  bind:maximum={hVariation.maximum}
/>
