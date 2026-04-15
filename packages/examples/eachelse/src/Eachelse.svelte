<script>
  let items = $state([]);
  function add() { items = [...items, `Item ${items.length + 1}`]; }
  function clear() { items = []; }
</script>

<div>
  {#each items as item}
    <div class="item">{item}</div>
  {:else}
    <div class="empty">No items yet</div>
  {/each}
  <div>Count: {items.length}</div>
  <button onclick={add}>Add</button>
  <button onclick={clear}>Clear</button>
</div>
