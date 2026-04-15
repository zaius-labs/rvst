<script>
  let lastKey = $state('none');
  let keyCount = $state(0);
</script>

<svelte:window onkeydown={(e) => { lastKey = e.key; keyCount++; }} />

<div>
  <div>Last key: {lastKey}</div>
  <div>Key count: {keyCount}</div>
</div>
