<script lang="ts">
  interface Props {
    brightnessMode: "set" | "keep" | "static";
    brightnessMultiplier: number;
  }

  let {
    brightnessMode = $bindable("set"),
    brightnessMultiplier = $bindable(1),
  }: Props = $props();
</script>

<div>
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
