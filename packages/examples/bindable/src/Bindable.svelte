<script>
  import PinInput from './PinInput.svelte';

  let pin = $state('');
</script>

<div>
  <PinInput bind:value={pin} />
  <div>Pin: {pin}</div>
  <div>Length: {pin.length}</div>
</div>
