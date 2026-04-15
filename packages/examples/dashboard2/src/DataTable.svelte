<script>
  let { rows } = $props();
  let sortKey = $state('name');
  let sortDir = $state(1);
  let filter = $state('');

  const sorted = $derived(
    rows
      .filter(r => r.name.toLowerCase().includes(filter.toLowerCase()))
      .slice()
      .sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        return typeof av === 'string'
          ? av.localeCompare(bv) * sortDir
          : (av - bv) * sortDir;
      })
  );

  function toggleSort(key) {
    if (sortKey === key) sortDir = -sortDir;
    else { sortKey = key; sortDir = 1; }
  }
</script>

<div class="table-wrap">
  <div class="filter-row">
    <input class="filter-input" bind:value={filter} placeholder="Filter by name" />
    <span class="count">Showing {sorted.length} / {rows.length}</span>
  </div>
  <div class="rows">
    <div class="row header-row">
      <button class="cell header-cell" onclick={() => toggleSort('name')}>Name</button>
      <button class="cell header-cell" onclick={() => toggleSort('score')}>Score</button>
      <button class="cell header-cell" onclick={() => toggleSort('status')}>Status</button>
    </div>
    {#each sorted as row}
      <div class="row">
        <span class="cell">{row.name}</span>
        <span class="cell">{row.score}</span>
        <span class="cell status" class:active={row.status === 'active'}>{row.status}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .table-wrap {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .filter-input {
    padding: 7px 12px;
    border-radius: 5px;
    font-size: 13px;
    background: #2a2a3a;
    color: #eee;
    flex: 1;
  }

  .count {
    font-size: 12px;
    color: #888;
    flex-shrink: 0;
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .row {
    display: flex;
    gap: 0;
  }

  .header-row {
    background: #1a1a2e;
    border-radius: 5px 5px 0 0;
  }

  .cell {
    flex: 1;
    padding: 9px 14px;
    font-size: 13px;
  }

  .header-cell {
    font-weight: 600;
    color: #aaa;
    font-size: 12px;
    text-align: left;
    background: transparent;
  }

  .status {
    color: #888;
  }

  .status.active {
    color: #5af05a;
  }
</style>
