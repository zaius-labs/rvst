<script>
  import Child from './Child.svelte';
  let count = $state(0);
  let name = $state('items');
</script>

<div>
  <Child label={name} value={count} onclick={() => count++} />
  <div>Total: {count}</div>
</div>
