<script>
  import { onMount } from 'svelte';
  // onMount — runs after component is inserted into the DOM.
  let status = $state('waiting');
  let clicks = $state(0);

  onMount(() => {
    status = 'mounted';
    return () => {
      // cleanup (onDestroy equivalent in runes)
      status = 'destroyed';
    };
  });
</script>
<div>
  <div>Status: {status}</div>
  <button onclick={() => clicks++}>Click</button>
  <div>Clicks: {clicks}</div>
</div>
