<script>
  let count = $state(0);
  let log = $state('init');

  $effect(() => {
    log = `count is ${count}`;
  });
</script>

<div>
  <button onclick={() => count++}>Increment</button>
  <div>Count: {count}</div>
  <div>Log: {log}</div>
</div>
