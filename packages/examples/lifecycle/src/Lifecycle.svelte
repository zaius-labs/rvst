<script>
  import { onMount, onDestroy } from 'svelte';

  let status = $state('idle');
  let ticks = $state(0);

  onMount(() => {
    status = 'mounted';
  });

  onDestroy(() => {
    status = 'destroyed';
  });
</script>

<div>
  <div>Status: {status}</div>
  <div>Ticks: {ticks}</div>
  <button onclick={() => ticks++}>Tick</button>
</div>
