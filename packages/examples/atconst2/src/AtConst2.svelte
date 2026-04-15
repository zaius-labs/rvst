<script>
  let numbers = $state([1, 4, 9, 16, 25]);
</script>

<div>
  {#each numbers as n}
    {@const sqrt = Math.sqrt(n)}
    {@const label = Number.isInteger(sqrt) ? 'perfect' : 'imperfect'}
    <div>{n}: sqrt={sqrt} ({label})</div>
  {/each}
  <div>Count: {numbers.length}</div>
</div>
