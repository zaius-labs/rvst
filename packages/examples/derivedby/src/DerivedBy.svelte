<script>
  // $derived.by() — derived state with a multi-statement function body.
  let items = $state([1, 2, 3, 4, 5]);

  const stats = $derived.by(() => {
    const sum = items.reduce((acc, n) => acc + n, 0);
    const avg = items.length > 0 ? sum / items.length : 0;
    return { sum, avg };
  });

  function addItem() {
    items.push(items.length + 1);
  }

  function removeItem() {
    if (items.length > 0) items.pop();
  }
</script>
<div>
  <div>Sum: {stats.sum}</div>
  <div>Avg: {stats.avg}</div>
  <button onclick={addItem}>Add</button>
  <button onclick={removeItem}>Remove</button>
</div>
