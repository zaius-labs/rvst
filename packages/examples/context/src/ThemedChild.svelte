<script>
  import { getContext } from 'svelte';
  const {} = $props();
  const theme = getContext('theme');
</script>

<div>Child sees: {theme.value}</div>
