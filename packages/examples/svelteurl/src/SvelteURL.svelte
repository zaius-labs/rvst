<script>
  import { SvelteURL } from 'svelte/reactivity';
  // Force runes mode.
  const {} = $props();
  // SvelteURL — reactive URL object; mutating pathname/search triggers re-render.
  const url = new SvelteURL('https://example.com/home');

  function goAbout() {
    url.pathname = '/about';
  }

  function addSearch() {
    url.searchParams.set('q', 'hello');
  }
</script>
<div>
  <div>Path: {url.pathname}</div>
  <div>Search: {url.search}</div>
  <button onclick={goAbout}>Go About</button>
  <button onclick={addSearch}>Add Search</button>
</div>
