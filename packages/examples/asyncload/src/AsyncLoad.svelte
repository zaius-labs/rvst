<script>
  let data = $state(null);
  let loading = $state(true);
  let error = $state(null);

  // Simulate a load() function — async data fetch
  async function loadData() {
    loading = true;
    error = null;
    try {
      // Simulate network delay with a resolved promise (no actual delay needed)
      const result = await Promise.resolve({ items: ['Alpha', 'Beta', 'Gamma'], count: 3 });
      data = result;
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  // Load on mount
  loadData();
</script>

<div style="display: flex; flex-direction: column; gap: 8px; padding: 16px;">
  <div>Async Load Demo</div>
  {#if loading}
    <div>Loading...</div>
  {:else if error}
    <div>Error: {error}</div>
  {:else if data}
    <div>Loaded: {data.count} items</div>
    {#each data.items as item}
      <div>- {item}</div>
    {/each}
  {/if}
  <div>Status: {loading ? 'loading' : 'ready'}</div>
</div>
