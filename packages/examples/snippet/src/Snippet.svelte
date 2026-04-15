<script>
  let fruits = $state(['apple', 'banana', 'cherry']);
</script>

{#snippet fruit(name)}
  <li>{name}</li>
{/snippet}

<div>
  <ul>
    {#each fruits as f}
      {@render fruit(f)}
    {/each}
  </ul>
  <div>Count: {fruits.length}</div>
  <button onclick={() => fruits = [...fruits, 'date']}>Add</button>
</div>
