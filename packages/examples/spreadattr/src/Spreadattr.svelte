<script>
  let theme = $state('light');
  let attrs = $state({ 'data-theme': 'light', title: 'Light mode' });

  function toggle() {
    if (theme === 'light') {
      theme = 'dark';
      attrs = { 'data-theme': 'dark', title: 'Dark mode' };
    } else {
      theme = 'light';
      attrs = { 'data-theme': 'light', title: 'Light mode' };
    }
  }
</script>

<div>
  <span {...attrs}>Content</span>
  <div>Theme: {theme}</div>
  <button onclick={toggle}>Toggle</button>
</div>
