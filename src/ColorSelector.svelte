<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  interface Props {
    colors?: string[];
  }

  let { colors = $bindable([]) }: Props = $props();
</script>

<div class="pb-2">
  <button
    class="btn btn-primary"
    onclick={() => (colors = [...colors, colors[0] ?? "#ffffff"])}
  >
    Add color
  </button>
  <button
    class="btn btn-success"
    onclick={() => dispatch("applyVariation", { colors })}
    disabled={!colors.length}
  >
    Apply current variation
  </button>
  <button
    class="btn btn-warning"
    onclick={() => (colors = [])}
    disabled={!colors.length}
  >
    Clear
  </button>
</div>
<div class={"grid grid-cols-5 gap-2"}>
  {#each colors as color, i}
    <div>
      <input type="color" class="x-swatch" bind:value={colors[i]} />
      <div class={"flex"}>
        <button
          class={"flex-1 btn btn-xs text-red-400"}
          onclick={() => (colors = colors.filter((_, j) => i !== j))}
          title="Remove color"
        >
          &times;
        </button>
        <button
          class={"flex-1 btn btn-xs text-green-500"}
          onclick={() => (colors = [...colors, color])}
          title="Duplicate color"
        >
          +
        </button>
        <button
          class={"flex-1 btn btn-xs"}
          onclick={() => dispatch("applyVariation", { colors, index: i })}
          title="Vary color"
        >
          ~
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  .x-swatch {
    width: 100%;
    height: auto;
    aspect-ratio: 1/1;
    appearance: none;
    padding: 0;
    margin: 0;
    border: 1px solid #333;
    background: none;
    cursor: pointer;
  }

  .x-swatch::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .x-swatch::-webkit-color-swatch {
    border: 0;
  }
</style>
