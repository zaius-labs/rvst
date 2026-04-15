<script>
  let { value = $bindable('') } = $props();
</script>

<input bind:value placeholder="Enter pin" />
