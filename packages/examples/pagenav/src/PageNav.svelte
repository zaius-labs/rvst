<script>
  import HomePage from './HomePage.svelte';
  import AboutPage from './AboutPage.svelte';

  let path = $state('/');
  let log = $state([]);

  function navigate(newPath) {
    history.pushState(null, '', newPath);
    path = newPath;
  }

  function addLog(msg) {
    log = [...log, msg];
  }

  globalThis.__pagenav_log = addLog;

  if (typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('popstate', () => {
      path = globalThis.location.pathname;
    });
  }
</script>

<div style="display: flex; flex-direction: column; gap: 8px; padding: 16px;">
  <div style="display: flex; gap: 8px;">
    <button onclick={() => navigate('/')}>Home</button>
    <button onclick={() => navigate('/about')}>About</button>
  </div>
  <div>Page: {path}</div>
  {#if path === '/'}
    <HomePage />
  {:else if path === '/about'}
    <AboutPage />
  {/if}
  <div>Events: {log.length}</div>
  <div>Last: {log.length > 0 ? log[log.length - 1] : 'none'}</div>
</div>
