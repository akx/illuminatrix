<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import VirtualList from "./vendor/VirtualList.svelte";
  import { getPalettes } from "./palettes";
  import type { Palette } from "./palettes/types";

  const dispatch = createEventDispatcher();
  let palettes: Palette[] = [];
  let collections: string[] = [];
  let collectionFilter: string = "";
  let paletteFilter: string = "";
  let minColors: number | null = null;
  let maxColors: number | null = null;
  let filteredPalettes: Palette[] = [];
  let append: boolean = false;
  let extendedSearch: boolean = false;

  $: applyOrAppend = append ? "Append" : "Apply";

  onMount(async () => {
    palettes = await getPalettes();
    collections = [...new Set(palettes.map((p) => p.collection))].sort();
  });

  function selectRandom() {
    let palette =
      filteredPalettes[Math.floor(Math.random() * filteredPalettes.length)];
    if (palette) dispatch("select", { palette, append });
  }

  function resetSearch() {
    collectionFilter = "";
    paletteFilter = "";
    minColors = null;
    maxColors = null;
  }

  $: {
    const filterRe = paletteFilter.trim()
      ? new RegExp(paletteFilter.trim(), "i")
      : null;
    filteredPalettes = palettes.filter(
      (p) =>
        (!collectionFilter || p.collection === collectionFilter) &&
        (!filterRe ||
          filterRe.test(p.name) ||
          filterRe.test((p.tags ?? []).join(" "))) &&
        (minColors === null || p.colors.length >= minColors) &&
        (maxColors === null || p.colors.length <= maxColors),
    );
  }
</script>

<div class="pb-2 px-1 flex justify-between align-middle">
  <div>
    <button class="btn join-item" on:click={selectRandom}>
      {applyOrAppend} random
    </button>
    <button class="btn join-item" on:click={resetSearch}>Reset search</button>
  </div>
</div>
<div class="pb-2 px-1 flex justify-between align-middle">
  <label class="label block cursor-pointer">
    <input type="checkbox" bind:checked={append} value="1" /> Append to current colors
  </label>
</div>

<div class={"flex"}>
  <select
    bind:value={collectionFilter}
    class={"flex-auto w-24 select-sm select"}
  >
    <option value="">All</option>
    {#each collections as collection}
      <option value={collection}>{collection}</option>
    {/each}
  </select>
  <input
    type="search"
    placeholder="Search"
    bind:value={paletteFilter}
    class={"input input-sm flex-auto w-32"}
  />
  <button
    class={"btn btn-sm join-item"}
    on:click={() => (extendedSearch = !extendedSearch)}
    title="Extended search"
  >
    {extendedSearch ? "-" : "+"}
  </button>
</div>
{#if extendedSearch}
  <div class={"flex py-2"}>
    <input
      type="number"
      min="1"
      bind:value={minColors}
      placeholder="Min colors"
      class={"input input-sm flex-auto"}
    />
    <input
      type="number"
      bind:value={maxColors}
      placeholder="Max colors"
      class={"input input-sm flex-auto"}
    />
  </div>
{/if}

{#key filteredPalettes.length}
  {#if !filteredPalettes.length}
    <div class={"text-center text-gray-500"}>No palettes found.</div>
  {:else}
    <VirtualList items={filteredPalettes} let:item height="500px">
      <button
        class={"appearance-none block w-full p-1 cursor-pointer text-left bg-transparent hover:bg-gray-300 dark:hover:bg-gray-700 border-0"}
        on:click={(e) =>
          dispatch("select", { palette: item, append: e.shiftKey || append })}
      >
        <div class="flex justify-between">
          <div>
            {item.name}
          </div>
          <div class={"text-xs text-gray-500"}>
            {#if item.author}{item.author}{/if}
            {#if item.collection}- {item.collection}{/if}
          </div>
        </div>
        <div class={"flex border border-solid border-black h-6"}>
          {#each item.colors as color}
            <div class={"flex-1"} style={`background-color: ${color}`} />
          {/each}
        </div>
      </button>
    </VirtualList>
  {/if}
{/key}
