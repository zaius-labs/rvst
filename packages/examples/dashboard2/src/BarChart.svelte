<script>
  let { data } = $props();
  const maxVal = $derived(Math.max(...data.map(d => d.value)));
</script>

<div class="chart">
  {#each data as bar}
    {@const pct = Math.round(bar.value / maxVal * 100)}
    <div class="bar-row">
      <span class="label">{bar.label}</span>
      <div class="bar-track">
        <div class="bar-fill" style:width="{pct}%">
          <span class="bar-val">{bar.value}</span>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .chart {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px 0;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .label {
    width: 52px;
    font-size: 12px;
    color: #aaa;
    text-align: right;
    flex-shrink: 0;
  }

  .bar-track {
    flex: 1;
    height: 22px;
    background: #2a2a3a;
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: #3a3af0;
    border-radius: 4px;
    min-width: 4px;
    display: flex;
    align-items: center;
  }

  .bar-val {
    padding: 0 6px;
    font-size: 11px;
    color: #fff;
  }
</style>
