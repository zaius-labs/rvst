<script>
  import Box from './Box.svelte';
  // Children snippet — passing content to a component via the children prop.
  let count = $state(0);
</script>
<div>
  <Box title="Counter">
    <span>Count: {count}</span>
  </Box>
  <Box>
    <span>No title box</span>
  </Box>
  <button onclick={() => count++}>Increment</button>
</div>
