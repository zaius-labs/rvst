<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  let sign = $derived(count > 0 ? 'positive' : count < 0 ? 'negative' : 'zero');
</script>

<div>
  <button onclick={() => count++}>+</button>
  <button onclick={() => count--}>-</button>
  <div>Count: {count}</div>
  <div>Doubled: {doubled}</div>
  <div>Sign: {sign}</div>
</div>
