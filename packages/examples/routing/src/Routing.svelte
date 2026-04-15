<script>
  let path = $state(globalThis.location?.pathname ?? '/');

  function navigate(newPath) {
    history.pushState(null, '', newPath);
    path = newPath;
  }

  // Listen for popstate (back/forward)
  if (typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('popstate', () => {
      path = globalThis.location.pathname;
    });
  }
</script>

<div>
  <div style="display: flex; gap: 8px;">
    <button onclick={() => navigate('/')}>Home</button>
    <button onclick={() => navigate('/about')}>About</button>
    <button onclick={() => navigate('/settings')}>Settings</button>
  </div>
  <div>Path: {path}</div>
  {#if path === '/'}
    <div>Welcome to the home page!</div>
  {:else if path === '/about'}
    <div>This is the about page.</div>
  {:else if path === '/settings'}
    <div>Settings go here.</div>
  {:else}
    <div>404: Page not found</div>
  {/if}
</div>
