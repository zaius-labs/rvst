<script>
  import { untrack } from 'svelte';
  import { generateDataset } from './lib/dataset.js';
  import { mark, measure, time, record, writeResults } from './lib/harness.js';

  let { rowCount = 1000, onReady } = $props();

  let allRows = $state([]);
  let rows = $state([]);
  let searchTerm = $state('');
  let sortCol = $state('id');
  let sortAsc = $state(true);
  let selectedId = $state(null);

  // Generate dataset on mount
  $effect(() => {
    untrack(() => {
      mark('mount_start');
      time('generate_dataset', () => {
        allRows = generateDataset(rowCount);
        rows = allRows;
      });
      measure('time_to_data', 'mount_start');
      if (onReady) onReady({ search, sort });
    });
  });

  // Filter
  function search(term) {
    const start = performance.now();
    searchTerm = term;
    if (!term.trim()) {
      rows = allRows;
    } else {
      const lower = term.toLowerCase();
      rows = allRows.filter(r =>
        r.name.toLowerCase().includes(lower) ||
        r.email.toLowerCase().includes(lower) ||
        r.department.toLowerCase().includes(lower) ||
        r.city.toLowerCase().includes(lower)
      );
    }
    record('last_search_ms', performance.now() - start);
  }

  // Sort
  function sort(col) {
    const start = performance.now();
    sortCol = col;
    sortAsc = sortCol === col ? !sortAsc : true;
    const dir = sortAsc ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const av = a[col], bv = b[col];
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
    record('last_sort_ms', performance.now() - start);
  }

  // Stats
  $effect(() => {
    // Computed whenever rows change
  });

  let selected = $derived(rows.find(r => r.id === selectedId));
  let avgSalary = $derived(rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.salary, 0) / rows.length) : 0);
  let avgScore = $derived(rows.length > 0 ? (rows.reduce((s, r) => s + r.score, 0) / rows.length).toFixed(1) : '0');

  const COLS = ['id', 'name', 'email', 'department', 'status', 'city', 'salary', 'score', 'joined'];
</script>

<div class="explorer">
  <div class="toolbar">
    <input
      class="search"
      type="text"
      placeholder="Search {allRows.length} records..."
      oninput={(e) => search(e.target.value)}
    />
    <div class="stats">
      {rows.length} of {allRows.length} · Avg salary: ${avgSalary.toLocaleString()} · Score: {avgScore}
    </div>
  </div>

  <div class="content">
    <div class="table-area">
      <div class="header-row">
        {#each COLS as col}
          <button class="th" class:sorted={sortCol === col} onclick={() => sort(col)}>
            {col} {sortCol === col ? (sortAsc ? '▲' : '▼') : ''}
          </button>
        {/each}
      </div>
      <div class="body">
        {#each rows as row, i (row.id)}
          <div
            class="row"
            class:even={i % 2 === 1}
            class:selected={row.id === selectedId}
            onclick={() => selectedId = row.id}
          >
            <span class="td">{row.id}</span>
            <span class="td">{row.name}</span>
            <span class="td">{row.email}</span>
            <span class="td">{row.department}</span>
            <span class="td status" class:active={row.status === 'active'}>{row.status}</span>
            <span class="td">{row.city}</span>
            <span class="td">${row.salary.toLocaleString()}</span>
            <span class="td">{row.score}</span>
            <span class="td">{row.joined}</span>
          </div>
        {/each}
      </div>
    </div>

    {#if selected}
      <div class="detail">
        <div class="detail-header">{selected.name}</div>
        <div class="detail-field"><span>Email</span><span>{selected.email}</span></div>
        <div class="detail-field"><span>Department</span><span>{selected.department}</span></div>
        <div class="detail-field"><span>Status</span><span>{selected.status}</span></div>
        <div class="detail-field"><span>City</span><span>{selected.city}</span></div>
        <div class="detail-field"><span>Salary</span><span>${selected.salary.toLocaleString()}</span></div>
        <div class="detail-field"><span>Score</span><span>{selected.score}</span></div>
        <div class="detail-field"><span>Joined</span><span>{selected.joined}</span></div>
      </div>
    {/if}
  </div>
</div>

<style>
  .explorer {
    background: #1e1e2e;
    color: #cdd6f4;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: #181825;
    border-bottom: 1px solid #313244;
  }
  .search {
    flex: 1;
    padding: 6px 10px;
    background: #313244;
    border: 1px solid #45475a;
    border-radius: 4px;
    color: #cdd6f4;
    font-size: 13px;
  }
  .stats {
    font-size: 11px;
    color: #6c7086;
    white-space: nowrap;
  }
  .content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .table-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .header-row {
    display: flex;
    background: #313244;
    flex-shrink: 0;
  }
  .th {
    flex: 1;
    padding: 6px 8px;
    font-size: 11px;
    font-weight: 600;
    color: #a6adc8;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
  }
  .th.sorted { color: #f9e2af; }
  .body {
    flex: 1;
    overflow: auto;
  }
  .row {
    display: flex;
    height: 28px;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid #181825;
  }
  .row:hover { background: #2a2a3c; }
  .row.even { background: #1a1a2e; }
  .row.selected { background: #313244; border-left: 3px solid #89b4fa; }
  .td {
    flex: 1;
    padding: 0 8px;
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
  }
  .status.active { color: #a6e3a1; }
  .detail {
    width: 280px;
    background: #181825;
    border-left: 1px solid #313244;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
  }
  .detail-header {
    font-size: 16px;
    font-weight: 700;
    color: #89b4fa;
    padding-bottom: 8px;
    border-bottom: 1px solid #313244;
  }
  .detail-field {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }
  .detail-field span:first-child { color: #6c7086; }
</style>
