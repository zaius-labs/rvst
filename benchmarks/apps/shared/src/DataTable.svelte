<script>
  import { untrack } from 'svelte';
  import { time, markFirstPaint } from './bench.js';

  let { ondone } = $props();

  const ROW_COUNT = 1000;
  const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance', 'HR', 'Legal', 'Ops'];
  const STATUSES = ['active', 'inactive', 'pending', 'suspended'];
  const COLS = ['id', 'name', 'email', 'score', 'status', 'created', 'department', 'revenue'];

  function generateRows(count) {
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
      out[i] = {
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        score: Math.round(Math.random() * 10000) / 100,
        status: STATUSES[i % STATUSES.length],
        created: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        revenue: Math.round(Math.random() * 1000000) / 100,
      };
    }
    return out;
  }

  let rows = $state([]);
  let sortCol = $state('id');
  let sortAsc = $state(true);

  function sortBy(col) {
    sortCol = col;
    sortAsc = sortCol === col ? !sortAsc : true;
    const dir = sortAsc ? 1 : -1;
    rows = rows.slice().sort((a, b) => {
      const av = a[col], bv = b[col];
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
  }

  $effect(() => {
    untrack(() => {
      time('table_generate', () => {
        rows = generateRows(ROW_COUNT);
      });

      time('table_sort', () => {
        sortBy('score');
      });

      markFirstPaint();
      if (ondone) ondone();
    });
  });
</script>

<div class="wrap">
  <div class="title">{ROW_COUNT} Rows — 8 Columns</div>
  <div class="header">
    {#each COLS as col}
      <button class="th" class:sorted={sortCol === col} onclick={() => sortBy(col)}>
        {col} {sortCol === col ? (sortAsc ? '▲' : '▼') : ''}
      </button>
    {/each}
  </div>
  <div class="body">
    {#each rows as row, i (row.id)}
      <div class="row" class:even={i % 2 === 1}>
        <span class="td">{row.id}</span>
        <span class="td">{row.name}</span>
        <span class="td">{row.email}</span>
        <span class="td">{row.score}</span>
        <span class="td">{row.status}</span>
        <span class="td">{row.created}</span>
        <span class="td">{row.department}</span>
        <span class="td">{row.revenue}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .wrap {
    background: #1e1e2e;
    color: #cdd6f4;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .title {
    padding: 12px 16px;
    font-size: 18px;
    font-weight: 700;
    color: #89b4fa;
  }
  .header {
    display: flex;
    flex-direction: row;
    background: #313244;
    position: sticky;
    top: 0;
  }
  .th {
    flex: 1;
    padding: 6px 8px;
    font-size: 12px;
    font-weight: 600;
    color: #a6adc8;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
  }
  .th.sorted {
    color: #f9e2af;
  }
  .body {
    flex: 1;
    overflow: auto;
  }
  .row {
    display: flex;
    flex-direction: row;
    height: 28px;
    align-items: center;
    border-bottom: 1px solid #313244;
  }
  .row.even {
    background: #24243a;
  }
  .td {
    flex: 1;
    padding: 0 8px;
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
