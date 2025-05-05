<script lang="ts">
  import cx from "clsx";
  import { createEventDispatcher } from "svelte";
  import type { LightState } from "./types/app";
  import { rgbTripleToHex } from "./helpers";
  import { groupLights } from "./lightSelectorHelpers";

  const dispatch = createEventDispatcher();

  interface Props {
    lights: LightState[];
    enabledLights: string[];
  }

  let { lights = [], enabledLights = $bindable([]) }: Props = $props();

  function setEnabledLights(
    mode: "set" | "add" | "remove",
    lights: readonly LightState[] = [],
    onlyNonGroups: boolean = false,
  ) {
    if (onlyNonGroups) {
      lights = lights.filter((l) => !l.isGroup);
    }
    const ids = lights.map((l) => l.id);

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

  let lightGroups = $derived(groupLights(lights, enabledLights));
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
      onclick={() => setEnabledLights("set", lights)}
    >
      All
    </button>
    <button class="btn btn-outline" onclick={() => setEnabledLights("set", [])}
      >None
    </button>
  </div>
  <div class="join">
    <button class="btn btn-outline" onclick={() => dispatch("reload")}
      >Reload
    </button>
  </div>
</div>
<table class="w-full">
  <tbody>
    {#each lightGroups as group (group.name)}
      {#if lightGroups.length > 1}
        <tr>
          <td class="font-bold">
            {group.name}
          </td>
          <td colspan="3" class="text-right">
            <button
              class="btn btn-outline btn-xs"
              onclick={(e) =>
                setEnabledLights("add", group.lights, !e.shiftKey)}
            >
              All
            </button>
            <button
              class="btn btn-outline btn-xs"
              onclick={(e) =>
                setEnabledLights("remove", group.lights, !e.shiftKey)}
            >
              None
            </button>
          </td></tr
        >
      {/if}
      {#each group.lights as light (light.id)}
        <tr>
          <td>
            <label>
              <input
                type="checkbox"
                bind:group={enabledLights}
                value={light.id}
              />
              <span
                class={cx({ "opacity-25": light.state === "unavailable" })}
                title={light.isGroup ? "Group" : undefined}
              >
                {#if light.isGroup}
                  📦
                {/if}
                {light.friendlyName ?? light.id}
              </span>
            </label>
          </td>
          <td>
            {#if light.state === "unavailable"}
              🚫
            {:else}
              <button
                class="btn btn-xs"
                onclick={() =>
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
              class="w-16"
              onchange={(e) =>
                dispatch("set", {
                  entityId: light.id,
                  brightness: e.currentTarget.valueAsNumber,
                })}
            />
          </td>
          <td class="w-1/4">
            <input
              type="color"
              class="w-full"
              disabled={light.state === "unavailable"}
              value={rgbTripleToHex(light.rgbColor ?? [255, 255, 255])}
              onchange={(e) =>
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
