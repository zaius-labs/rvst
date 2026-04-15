<script>
  import { setContext } from 'svelte';
  import ThemedChild from './ThemedChild.svelte';

  let theme = $state('light');
  setContext('theme', { get value() { return theme; } });

  function toggle() { theme = theme === 'light' ? 'dark' : 'light'; }
</script>

<div>
  <ThemedChild />
  <button onclick={toggle}>Toggle Theme</button>
  <div>Root: {theme}</div>
</div>
