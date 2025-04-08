<script lang="ts">
  interface Props {
    label?: string;
    variation?: number;
    minimum?: number;
    maximum?: number;
  }

  let {
    label = "...",
    variation = $bindable(0.1),
    minimum = $bindable(0.1),
    maximum = $bindable(1),
  }: Props = $props();
</script>

<div class="card card-compact">
  <div class="card-body">
    <h3 class="text-2xl">
      {label}
    </h3>
    <label>
      <span>Variation:</span>
      <input
        class="range"
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={variation}
      />
      <span class="v">{(variation * 100).toFixed(1)}%</span>
    </label>
    <label>
      <span>Minimum:</span>
      <input
        class="range"
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={minimum}
      />
      <span class="v">{minimum.toFixed(2)}</span>
    </label>
    <label>
      <span>Maximum:</span>
      <input
        class="range"
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={maximum}
      />
      <span class="v">{maximum.toFixed(2)}</span>
    </label>
  </div>
</div>

<style>
  label {
    display: flex;
  }

  label > span,
  label > input {
    flex: 2;
  }

  span.v {
    flex: 1;
    display: inline-block;
    text-align: right;
  }
</style>
