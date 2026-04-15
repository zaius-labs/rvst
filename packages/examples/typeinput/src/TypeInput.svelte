<script>
  let name = $state('');
  let charCount = $derived(name.length);
</script>

<div>
  <input placeholder="Type here" bind:value={name} />
  <div>Value: {name}</div>
  <div>Chars: {charCount}</div>
</div>
