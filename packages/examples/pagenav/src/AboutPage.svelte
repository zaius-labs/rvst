<script>
  import { onMount, onDestroy } from 'svelte';

  // Probe: did this component function execute?
  globalThis.__about_was_called = true;

  onMount(() => {
    globalThis.__pagenav_log?.('about:mount');
  });

  onDestroy(() => {
    globalThis.__pagenav_log?.('about:destroy');
  });
</script>

<div>About this app</div>
