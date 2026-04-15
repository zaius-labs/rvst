<script>
  import { onMount, onDestroy } from 'svelte';

  let { onMounted, onDestroyed } = $props();

  onMount(() => {
    onMounted?.();
  });

  onDestroy(() => {
    onDestroyed?.();
  });
</script>

<div>Child Active</div>
