<script>
  let count = $state(0);
  function increment() { count++; }
</script>

<button onclick={increment}>Count: {count}</button>
