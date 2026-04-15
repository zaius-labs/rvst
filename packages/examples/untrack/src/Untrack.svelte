<script>
  import { untrack } from 'svelte';

  let count = $state(0);
  let snapshots = $state([]);

  $effect(() => {
    // Read count reactively (creates dependency), but read snapshots without dependency
    const current = count;
    const prevLength = untrack(() => snapshots.length);
    snapshots = [...untrack(() => snapshots), `snap-${current}-prev${prevLength}`];
  });

  function increment() { count++; }
</script>
<div>
  <div>Count: {count}</div>
  <div>Snapshots: {snapshots.length}</div>
  <div>Last: {snapshots[snapshots.length - 1] ?? 'none'}</div>
  <button onclick={increment}>Increment</button>
</div>
