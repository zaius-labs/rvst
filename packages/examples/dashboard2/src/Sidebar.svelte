<script>
  let { view, onNavigate } = $props();
  const sections = ['home', 'reports', 'settings'];
</script>

<nav class="sidebar">
  <div class="nav-title">Dashboard</div>
  {#each sections as section}
    <button
      class="nav-btn"
      class:active={view === section}
      onclick={() => onNavigate(section)}
    >
      {section.charAt(0).toUpperCase() + section.slice(1)}
    </button>
  {/each}
</nav>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    width: 160px;
    min-width: 160px;
    padding: 16px 12px;
    gap: 6px;
    background: #1a1a2e;
  }

  .nav-title {
    font-size: 13px;
    font-weight: 700;
    padding: 0 8px 12px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .nav-btn {
    padding: 9px 12px;
    border-radius: 6px;
    font-size: 14px;
    text-align: left;
    background: transparent;
    color: #ccc;
  }

  .nav-btn.active {
    background: #3a3af0;
    color: #fff;
  }
</style>
