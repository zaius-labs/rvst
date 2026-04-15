<script>
  let items = $state(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
</script>

<div>
  <div>Scroll Demo</div>
  <div style="height: 200px; overflow: auto;">
    {#each items as item}
      <div>{item}</div>
    {/each}
  </div>
  <div>Total: {items.length}</div>
</div>
