<script>
  let checked = $state(false);
</script>
<div>
  <input type="checkbox" bind:checked={checked}>
  <span>{checked ? 'Checked!' : 'Unchecked'}</span>
</div>
