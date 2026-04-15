<script>
  // $state.snapshot() — creates a deep plain-object copy of reactive state.
  let items = $state(['a', 'b', 'c']);
  let snapshots = $state([]);

  function takeSnapshot() {
    snapshots.push($state.snapshot(items));
  }

  function addItem() {
    items.push(String.fromCharCode(97 + items.length));
  }
</script>
<div>
  <div>Items: {items.join(', ')}</div>
  <div>Snapshots taken: {snapshots.length}</div>
  {#if snapshots.length > 0}
    <div>Last snapshot: {snapshots[snapshots.length - 1].join(', ')}</div>
  {/if}
  <button onclick={addItem}>Add Item</button>
  <button onclick={takeSnapshot}>Take Snapshot</button>
</div>
