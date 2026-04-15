<script>
  let picked = $state('a');
</script>

<div>
  <label>
    <input type="radio" bind:group={picked} value="a" />
    Option A
  </label>
  <label>
    <input type="radio" bind:group={picked} value="b" />
    Option B
  </label>
  <label>
    <input type="radio" bind:group={picked} value="c" />
    Option C
  </label>
  <div>Picked: {picked}</div>
</div>
