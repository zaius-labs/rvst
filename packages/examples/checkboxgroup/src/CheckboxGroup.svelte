<script>
  let selected = $state([]);
  const options = ['apple', 'banana', 'cherry'];
</script>

<div>
  {#each options as option}
    <label>
      <input type="checkbox" bind:group={selected} value={option} />
      {option}
    </label>
  {/each}
  <div>Selected: {selected.join(', ')}</div>
  <div>Count: {selected.length}</div>
</div>
