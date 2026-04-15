<script>
  import { MediaQuery } from 'svelte/reactivity';
  // Force runes mode so push(props, true) is emitted (needed for svelte/reactivity).
  const {} = $props();
  // MediaQuery — reactive wrapper around window.matchMedia.
  // In headless env, window.matchMedia always returns matches=false (default stub).
  const narrow = new MediaQuery('(max-width: 600px)');
  const wide = new MediaQuery('(min-width: 601px)');
</script>
<div>
  <div>Narrow: {narrow.current}</div>
  <div>Wide: {wide.current}</div>
  {#if narrow.current}
    <div>Mobile layout</div>
  {:else}
    <div>Desktop layout</div>
  {/if}
</div>
