<script>
  // {#snippet} with parameters — reusable named template fragments.
  let items = $state(['apple', 'banana', 'cherry']);
</script>

{#snippet badge(label, color)}
  <div class={color}>{label}</div>
{/snippet}

{#snippet listItem(text, index)}
  <div>{index + 1}. {text}</div>
{/snippet}

<div>
  {@render badge('New', 'green')}
  {@render badge('Sale', 'red')}

  <div>
    {#each items as item, i}
      {@render listItem(item, i)}
    {/each}
  </div>

  <div>Total: {items.length}</div>
</div>
