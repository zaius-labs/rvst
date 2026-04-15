<script>
  import Layout from './Layout.svelte';
  import { onMount } from 'svelte';

  let path = $state('/');

  function navigate(newPath) {
    history.pushState(null, '', newPath);
    path = newPath;
  }

  if (typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('popstate', () => {
      path = globalThis.location.pathname;
    });
  }
</script>

<Layout {path}>
  {#snippet children()}
    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
      <button onclick={() => navigate('/')}>Home</button>
      <button onclick={() => navigate('/about')}>About</button>
      <button onclick={() => navigate('/contact')}>Contact</button>
    </div>
    {#if path === '/'}
      <div>Welcome to the app!</div>
    {:else if path === '/about'}
      <div>Learn more about us.</div>
    {:else if path === '/contact'}
      <div>Get in touch.</div>
    {:else}
      <div>Page not found.</div>
    {/if}
  {/snippet}
</Layout>
