<script>
  import { SAMPLE_ROWS, CHART_DATA } from './data.js';
  import DataTable from './DataTable.svelte';
  import BarChart from './BarChart.svelte';
  import Sidebar from './Sidebar.svelte';

  let view = $state('home');
  let username = $state('Admin');
</script>

<div class="layout">
  <Sidebar {view} onNavigate={(v) => (view = v)} />
  <main class="main">
    <header class="header">
      <h1 class="heading">Welcome, {username}</h1>
      <span class="view-badge">{view}</span>
    </header>
    <div class="content">
      {#if view === 'home'}
        <section class="section">
          <h2 class="section-title">Overview</h2>
          <BarChart data={CHART_DATA} />
        </section>
      {:else if view === 'reports'}
        <section class="section">
          <h2 class="section-title">Reports</h2>
          <DataTable rows={SAMPLE_ROWS} />
        </section>
      {:else if view === 'settings'}
        <section class="section">
          <h2 class="section-title">Settings</h2>
          <div class="field-row">
            <label class="field-label">Username</label>
            <input class="field-input" bind:value={username} />
          </div>
        </section>
      {/if}
    </div>
  </main>
</div>

<style>
  .layout {
    display: flex;
    height: 100%;
    font-family: sans-serif;
    background: #13131f;
    color: #eee;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #2a2a3a;
    background: #16162a;
  }

  .heading {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .view-badge {
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
  }

  .content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #ccc;
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .field-label {
    font-size: 13px;
    color: #aaa;
    width: 80px;
  }

  .field-input {
    padding: 8px 12px;
    border-radius: 5px;
    background: #2a2a3a;
    color: #eee;
    font-size: 14px;
    width: 200px;
  }
</style>
