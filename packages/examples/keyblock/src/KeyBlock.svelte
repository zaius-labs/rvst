<script>
  let key = $state(0);
  let label = $state('A');

  function cycle() {
    key++;
    label = label === 'A' ? 'B' : 'A';
  }
</script>

<div>
  {#key key}
    <div>Key content: {label}</div>
  {/key}
  <button onclick={cycle}>Cycle</button>
  <div>Key value: {key}</div>
</div>
