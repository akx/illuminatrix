<script lang="ts">
  import cx from "clsx";
  import orderBy from "lodash-es/orderBy";
  import groupBy from "lodash-es/groupBy";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  import type { LightState } from "./types/app";
  import { rgbTripleToHex } from "./helpers";

  export let lights: LightState[] = [];
  export let enabledLights: string[] = [];

  function sortLights(lights: readonly LightState[]): LightState[] {
    return orderBy(
      lights,
      [
        (l: LightState) => ["unavailable", "off", "on"].indexOf(l.state),
        (l: LightState) => l.friendlyName ?? l.id,
      ],
      ["desc", "asc"],
    );
  }

  function setEnabledLights(
    mode: "set" | "add" | "remove",
    ids: string[] = [],
  ) {
    switch (mode) {
      case "set":
        enabledLights = ids;
        break;
      case "add":
        enabledLights = [...new Set([...enabledLights, ...ids])];
        break;
      case "remove":
        enabledLights = enabledLights.filter((id) => !ids.includes(id));
        break;
    }
  }

  $: groupedLights = groupBy(
    lights,
    (l: LightState) => l.areaFriendlyName ?? "\uFEFFOther",
  );
  $: groupOrder = Object.keys(groupedLights).sort();
  const stateTexts = {
    unavailable: "🚫",
    off: "Off",
    on: "On",
  };
</script>

<div class="flex flex-row space-x-2 justify-between">
  <div class="pb-2">
    <button
      class="btn btn-outline"
      on:click={() =>
        setEnabledLights(
          "set",
          lights.map((l) => l.id),
        )}
    >
      All
    </button>
    <button class="btn btn-outline" on:click={() => setEnabledLights("set", [])}
      >None
    </button>
  </div>
  <div class="join">
    <button class="btn btn-outline" on:click={() => dispatch("reload")}
      >Reload
    </button>
  </div>
</div>
<table class={"w-full"}>
  <tbody>
    {#each groupOrder as area}
      {#if groupOrder.length > 1}
        <tr>
          <td class={"font-bold"}>
            {area}
          </td>
          <td colspan="3" class="text-right">
            <button
              class="btn btn-outline btn-xs"
              on:click={() =>
                setEnabledLights(
                  "add",
                  groupedLights[area].map((l) => l.id),
                )}
            >
              All
            </button>
            <button
              class="btn btn-outline btn-xs"
              on:click={() =>
                setEnabledLights(
                  "remove",
                  groupedLights[area].map((l) => l.id),
                )}
            >
              None
            </button>
          </td>
        </tr>
      {/if}
      {#each sortLights(groupedLights[area]) as light}
        <tr>
          <td>
            <label>
              <input
                type="checkbox"
                bind:group={enabledLights}
                value={light.id}
              />
              <span class={cx({ "opacity-25": light.state === "unavailable" })}>
                {light.friendlyName ?? light.id}
              </span>
            </label>
          </td>
          <td>
            {#if light.state === "unavailable"}
              🚫
            {:else}
              <button
                on:click={() =>
                  dispatch("set", {
                    entityId: light.id,
                    state: light.state !== "on",
                  })}
              >
                {stateTexts[light.state]}
              </button>
            {/if}
          </td>
          <td>
            <input
              type="range"
              min="0"
              max="255"
              value={light.brightness ?? 0}
              disabled={light.state === "unavailable"}
              class={"w-16"}
              on:change={(e) =>
                dispatch("set", {
                  entityId: light.id,
                  brightness: e.currentTarget.valueAsNumber,
                })}
            />
          </td>
          <td class={"w-1/4"}>
            <input
              type="color"
              class={"w-full"}
              disabled={light.state === "unavailable"}
              value={rgbTripleToHex(light.rgbColor ?? [255, 255, 255])}
              on:change={(e) =>
                dispatch("set", {
                  entityId: light.id,
                  color: e.currentTarget.value,
                })}
            />
          </td>
        </tr>
      {/each}
    {/each}
  </tbody>
</table>
