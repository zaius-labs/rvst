<script>
  import Button from './Button.svelte';
  // Spread props — pass extra attributes to a child element via {...rest}.
  let count = $state(0);
</script>
<div>
  <Button label="Click me" onclick={() => count++} />
  <div>Count: {count}</div>
</div>
