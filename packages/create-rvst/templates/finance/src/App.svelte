<script>
  import TrafficLights from "./TrafficLights.svelte";

  let selectedStock = $state("AAPL");
  let timeRange = $state("1M");

  const summaryCards = [
    { label: "Net Worth", value: "$142,580", change: "+2.4%", color: "#a6e3a1" },
    { label: "Stocks",    value: "$89,200",  change: "+1.8%", color: "#a6e3a1" },
    { label: "Crypto",    value: "$31,400",  change: "-3.2%", color: "#f38ba8" },
    { label: "Cash",      value: "$21,980",  change: "---",   color: "#6c7086" },
  ];

  const chartData = [
    { h: 45, date: "Mar 1"  }, { h: 52, date: "Mar 3"  }, { h: 48, date: "Mar 5"  },
    { h: 61, date: "Mar 7"  }, { h: 55, date: "Mar 9"  }, { h: 70, date: "Mar 11" },
    { h: 65, date: "Mar 13" }, { h: 78, date: "Mar 15" }, { h: 72, date: "Mar 17" },
    { h: 85, date: "Mar 19" }, { h: 80, date: "Mar 21" }, { h: 74, date: "Mar 23" },
    { h: 90, date: "Mar 25" }, { h: 88, date: "Mar 27" }, { h: 95, date: "Mar 29" },
    { h: 82, date: "Mar 31" }, { h: 77, date: "Apr 2"  }, { h: 92, date: "Apr 4"  },
    { h: 87, date: "Apr 6"  }, { h: 98, date: "Apr 8"  },
  ];

  const watchlist = [
    { symbol: "AAPL",  price: "189.84", change: "+1.24", pct: "+0.66%", volume: "52.3M", up: true  },
    { symbol: "GOOGL", price: "141.80", change: "+2.15", pct: "+1.54%", volume: "28.1M", up: true  },
    { symbol: "MSFT",  price: "378.91", change: "-1.32", pct: "-0.35%", volume: "19.7M", up: false },
    { symbol: "TSLA",  price: "248.42", change: "-5.80", pct: "-2.28%", volume: "98.4M", up: false },
    { symbol: "NVDA",  price: "495.22", change: "+8.45", pct: "+1.73%", volume: "41.2M", up: true  },
    { symbol: "AMZN",  price: "178.25", change: "+0.92", pct: "+0.52%", volume: "35.8M", up: true  },
    { symbol: "META",  price: "505.75", change: "+3.18", pct: "+0.63%", volume: "16.9M", up: true  },
    { symbol: "BRK.B", price: "363.17", change: "-0.48", pct: "-0.13%", volume: "3.2M",  up: false },
  ];

  let transactions = $state([
    { date: "Mar 29", desc: "AAPL Dividend Q1",           amount: "+$94.20",    positive: true,  category: "Dividend" },
    { date: "Mar 28", desc: "Buy 10 NVDA @ $486.77",      amount: "-$4,867.70", positive: false, category: "Buy"      },
    { date: "Mar 26", desc: "Sell 25 TSLA @ $254.22",     amount: "+$6,355.50", positive: true,  category: "Sell"     },
    { date: "Mar 24", desc: "Transfer to Savings",         amount: "-$2,000.00", positive: false, category: "Transfer" },
    { date: "Mar 22", desc: "MSFT Dividend Q1",           amount: "+$187.50",   positive: true,  category: "Dividend" },
    { date: "Mar 20", desc: "Buy 5 META @ $498.30",       amount: "-$2,491.50", positive: false, category: "Buy"      },
  ]);

  const timeRanges = ["1D", "1W", "1M", "1Y"];

  function barColor(h) {
    const t = (h - 40) / 60;
    const r = Math.round(137 + t * (166 - 137));
    const g = Math.round(180 + t * (227 - 180));
    const b = Math.round(250 + t * (161 - 250));
    return `rgb(${r}, ${g}, ${b})`;
  }

  $effect(() => { globalThis.__rvst?.disableDecorations(); });

  const startDrag = (e) => {
    if (!e.target.closest("button")) {
      globalThis.__rvst?.startDragging();
    }
  };
</script>

<div class="shell">

  <!-- Titlebar -->
  <div class="titlebar" onmousedown={startDrag} role="banner">
    <TrafficLights />
    <span class="win-title">Portfolio</span>
    <div class="titlebar-spacer"></div>
  </div>

  <div class="content">

    <!-- Summary Cards -->
    <div class="summary-row">
      {#each summaryCards as card}
        <div class="summary-card">
          <div class="summary-label">{card.label}</div>
          <div class="summary-value">{card.value}</div>
          <div class="summary-change" style="color: {card.color}">{card.change}</div>
        </div>
      {/each}
    </div>

    <!-- Middle Section -->
    <div class="middle-row">

      <!-- Chart -->
      <div class="chart-panel">
        <div class="chart-header">
          <div class="chart-title">{selectedStock} Performance</div>
          <div class="time-range-btns">
            {#each timeRanges as tr}
              <button
                class="tr-btn {timeRange === tr ? 'active' : ''}"
                onclick={() => timeRange = tr}
              >{tr}</button>
            {/each}
          </div>
        </div>
        <div class="chart-area">
          {#each chartData as bar, i}
            <div class="bar-col">
              <div
                class="bar"
                style="height: {bar.h}%; background-color: {barColor(bar.h)}"
              ></div>
              {#if i % 4 === 0}
                <div class="bar-label">{bar.date}</div>
              {:else}
                <div class="bar-label"></div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Watchlist -->
      <div class="watchlist-panel">
        <div class="watchlist-title">Watchlist</div>
        <div class="watchlist-header-row">
          <span class="wl-col sym">Symbol</span>
          <span class="wl-col price">Price</span>
          <span class="wl-col change">Change</span>
          <span class="wl-col vol">Volume</span>
        </div>
        {#each watchlist as stock}
          <button
            class="watchlist-row {selectedStock === stock.symbol ? 'selected' : ''}"
            onclick={() => selectedStock = stock.symbol}
          >
            <span class="wl-col sym">{stock.symbol}</span>
            <span class="wl-col price">${stock.price}</span>
            <span class="wl-col change" style="color: {stock.up ? '#a6e3a1' : '#f38ba8'}">
              {stock.pct}
            </span>
            <span class="wl-col vol">{stock.volume}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="transactions-panel">
      <div class="transactions-title">Recent Transactions</div>
      <div class="tx-header-row">
        <span class="tx-col date">Date</span>
        <span class="tx-col desc">Description</span>
        <span class="tx-col amount">Amount</span>
        <span class="tx-col cat">Category</span>
      </div>
      {#each transactions as tx}
        <div class="tx-row">
          <span class="tx-col date">{tx.date}</span>
          <span class="tx-col desc">{tx.desc}</span>
          <span class="tx-col amount" style="color: {tx.positive ? '#a6e3a1' : '#f38ba8'}">
            {tx.amount}
          </span>
          <span class="tx-col cat">
            <span class="cat-pill {tx.category.toLowerCase()}">{tx.category}</span>
          </span>
        </div>
      {/each}
    </div>

  </div>
</div>

<style>
  /* ── Shell ──────────────────────────────────────────────────────────── */
  .shell {
    display: flex; flex-direction: column; width: 100%; height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13px;
    background-color: #1e1e2e; color: #cdd6f4;
  }

  /* ── Titlebar ──────────────────────────────────────────────────────── */
  .titlebar {
    display: flex; flex-direction: row; align-items: center;
    height: 38px; min-height: 38px;
    background-color: #181825; border-bottom: 1px solid #313244;
    padding-right: 12px;
  }
  .win-title {
    flex: 1; text-align: center; font-size: 13px; font-weight: 600;
    color: #a6adc8; letter-spacing: 0.02em;
  }
  .titlebar-spacer { width: 68px; }

  /* ── Content ───────────────────────────────────────────────────────── */
  .content {
    display: flex; flex-direction: column; flex: 1;
    padding: 20px 24px; gap: 16px; overflow-y: auto;
  }

  /* ── Summary Cards ─────────────────────────────────────────────────── */
  .summary-row { display: flex; flex-direction: row; gap: 12px; }
  .summary-card {
    flex: 1; display: flex; flex-direction: column; gap: 4px;
    background-color: #181825; border-radius: 8px;
    padding: 16px 20px;
  }
  .summary-label { font-size: 12px; color: #6c7086; }
  .summary-value { font-size: 24px; font-weight: 700; color: #cdd6f4; }
  .summary-change { font-size: 13px; font-weight: 600; }

  /* ── Middle Row ────────────────────────────────────────────────────── */
  .middle-row { display: flex; flex-direction: row; gap: 16px; min-height: 0; }

  /* ── Chart Panel ───────────────────────────────────────────────────── */
  .chart-panel {
    flex: 2; display: flex; flex-direction: column;
    background-color: #181825; border-radius: 8px; padding: 16px 20px;
  }
  .chart-header {
    display: flex; flex-direction: row; align-items: center;
    justify-content: space-between; margin-bottom: 16px;
  }
  .chart-title { font-size: 14px; font-weight: 600; color: #cdd6f4; }
  .time-range-btns { display: flex; flex-direction: row; gap: 4px; }
  .tr-btn {
    background: none; border: 1px solid #313244; color: #6c7086;
    font-size: 11px; padding: 4px 10px; border-radius: 5px; cursor: pointer;
  }
  .tr-btn.active {
    background-color: #89b4fa; color: #1e1e2e; border-color: #89b4fa; font-weight: 600;
  }
  .chart-area {
    flex: 1; display: flex; flex-direction: row; align-items: flex-end;
    gap: 4px; min-height: 140px;
  }
  .bar-col {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: flex-end; height: 100%;
  }
  .bar {
    width: 100%; border-radius: 3px 3px 0 0; min-height: 4px;
    transition: height 0.2s ease;
  }
  .bar-label {
    font-size: 9px; color: #585b70; margin-top: 6px;
    white-space: nowrap; min-height: 12px;
  }

  /* ── Watchlist Panel ───────────────────────────────────────────────── */
  .watchlist-panel {
    flex: 1; display: flex; flex-direction: column;
    background-color: #181825; border-radius: 8px; padding: 16px 20px;
    overflow-y: auto;
  }
  .watchlist-title {
    font-size: 14px; font-weight: 600; color: #cdd6f4; margin-bottom: 12px;
  }
  .watchlist-header-row {
    display: flex; flex-direction: row; align-items: center;
    padding: 0 8px 8px 8px; border-bottom: 1px solid #313244;
    font-size: 10px; font-weight: 700; color: #585b70;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .watchlist-row {
    display: flex; flex-direction: row; align-items: center;
    padding: 8px; background: none; border: none; border-bottom: 1px solid #313244;
    color: #cdd6f4; cursor: pointer; font-size: 13px; width: 100%;
    text-align: left; border-radius: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .watchlist-row:hover { background-color: #1e1e2e; }
  .watchlist-row.selected { background-color: #313244; border-radius: 4px; }
  .wl-col.sym   { flex: 1; font-weight: 600; }
  .wl-col.price { flex: 1; text-align: right; }
  .wl-col.change { flex: 1; text-align: right; font-weight: 600; }
  .wl-col.vol   { flex: 1; text-align: right; color: #6c7086; }

  /* ── Transactions Panel ────────────────────────────────────────────── */
  .transactions-panel {
    display: flex; flex-direction: column;
    background-color: #181825; border-radius: 8px; padding: 16px 20px;
  }
  .transactions-title {
    font-size: 14px; font-weight: 600; color: #cdd6f4; margin-bottom: 12px;
  }
  .tx-header-row {
    display: flex; flex-direction: row; align-items: center;
    padding: 0 0 8px 0; border-bottom: 1px solid #313244;
    font-size: 10px; font-weight: 700; color: #585b70;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .tx-row {
    display: flex; flex-direction: row; align-items: center;
    padding: 10px 0; border-bottom: 1px solid #313244;
  }
  .tx-col.date   { width: 80px; color: #6c7086; }
  .tx-col.desc   { flex: 1; color: #cdd6f4; text-align: left; }
  .tx-col.amount { width: 110px; text-align: right; font-weight: 600; }
  .tx-col.cat    { width: 90px; text-align: right; }

  /* ── Category Pills ────────────────────────────────────────────────── */
  .cat-pill {
    font-size: 10px; font-weight: 600; padding: 3px 10px;
    border-radius: 10px; text-transform: uppercase;
  }
  .cat-pill.dividend { background-color: #1e3a2f; color: #a6e3a1; }
  .cat-pill.buy      { background-color: #1e2a3d; color: #89b4fa; }
  .cat-pill.sell     { background-color: #3d2a1a; color: #fab387; }
  .cat-pill.transfer { background-color: #313244; color: #6c7086; }
</style>
