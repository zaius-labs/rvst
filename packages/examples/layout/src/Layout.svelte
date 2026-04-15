<script>
  import { onMount } from 'svelte';

  let { children, path } = $props();
  let layoutMounted = $state(false);

  onMount(() => {
    layoutMounted = true;
  });
</script>

<div style="display: flex; flex-direction: column; gap: 8px; padding: 16px;">
  <div style="display: flex; gap: 8px; padding: 8px; background: #2a2a3a;">
    <div>App Shell</div>
    <div>|</div>
    <div>Layout: {layoutMounted ? 'mounted' : 'pending'}</div>
    <div>|</div>
    <div>Route: {path}</div>
  </div>
  <div>
    {@render children()}
  </div>
  <div style="padding: 4px; background: #1a1a2a;">Footer</div>
</div>
