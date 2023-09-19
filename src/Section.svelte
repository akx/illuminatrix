<script lang="ts">
  import cx from "clsx";

  export let title: string;
  export let open: boolean = true;
</script>

<div class={cx({ "md:flex-1": open })}>
  <button
    class={cx(
      `block text-xl m-0 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 p-2 rounded-lg appearance-none border-0 w-full`,
      { "md:h-4/5": !open, "header-closed": !open },
    )}
    on:click={() => (open = !open)}
  >
    <span>{title}</span>
  </button>
  {#if open}
    <div class={"py-2"}>
      <slot />
    </div>
  {/if}
</div>

<style>
  @media (min-width: 640px) {
    .header-closed > span {
      writing-mode: vertical-rl;
      /*text-orientation: mixed;*/
    }
  }
</style>
