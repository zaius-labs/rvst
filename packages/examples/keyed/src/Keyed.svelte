<script>
  let items = $state([
    { id: 1, text: 'Alpha' },
    { id: 2, text: 'Beta' },
    { id: 3, text: 'Gamma' },
  ]);

  function remove(id) {
    items = items.filter(i => i.id !== id);
  }

  function prepend() {
    const next = items.length + 1;
    items = [{ id: next + 100, text: `New ${next}` }, ...items];
  }
</script>

<div>
  {#each items as item (item.id)}
    <div class="item">
      <span>{item.text}</span>
      <button onclick={() => remove(item.id)}>x</button>
    </div>
  {/each}
  <div>Count: {items.length}</div>
  <button onclick={prepend}>Prepend</button>
</div>
