<script>
  let items = $state([
    { name: 'Alice', score: 85 },
    { name: 'Bob', score: 72 },
    { name: 'Carol', score: 91 },
  ]);

  function downgrade() {
    items = items.map(i => ({ ...i, score: Math.max(0, i.score - 10) }));
  }
</script>

<div>
  {#each items as item}
    {@const grade = item.score >= 90 ? 'A' : item.score >= 80 ? 'B' : 'C'}
    <div>{item.name}: {grade}</div>
  {/each}
  <button onclick={downgrade}>Downgrade</button>
</div>
