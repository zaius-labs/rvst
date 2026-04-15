<script>
  import { measureFps } from './bench.js';

  let { ondone } = $props();

  let counters = $state([0, 0, 0, 0]);
  let charts = $state([
    Array.from({ length: 20 }, () => Math.random() * 100),
    Array.from({ length: 20 }, () => Math.random() * 100),
    Array.from({ length: 20 }, () => Math.random() * 100),
  ]);
  let progress = $state([25, 50, 75, 40]);
  let fps = $state(null);

  let intervals = [];

  $effect(() => {
    // Counters update every 16ms
    const counterInterval = setInterval(() => {
      counters = counters.map(c => c + Math.floor(Math.random() * 10));
    }, 16);
    intervals.push(counterInterval);

    // Bar charts update every 100ms
    const chartInterval = setInterval(() => {
      charts = charts.map(chart =>
        chart.map(v => Math.max(0, Math.min(100, v + (Math.random() - 0.5) * 20)))
      );
    }, 100);
    intervals.push(chartInterval);

    // Progress bars with random walk every 16ms
    const progressInterval = setInterval(() => {
      progress = progress.map(p =>
        Math.max(0, Math.min(100, p + (Math.random() - 0.5) * 4))
      );
    }, 16);
    intervals.push(progressInterval);

    // Measure FPS over 5 seconds
    measureFps(3000).then(result => {
      fps = result;
      // Clean up intervals before calling ondone
      intervals.forEach(id => clearInterval(id));
      intervals = [];
      if (ondone) ondone();
    });

    return () => {
      intervals.forEach(id => clearInterval(id));
      intervals = [];
    };
  });
</script>

<div class="dashboard">
  <h2>Dashboard - Real-time Updates</h2>

  <div class="counters">
    {#each counters as c, i}
      <div class="counter-card">
        <div class="counter-label">Counter {i + 1}</div>
        <div class="counter-value">{c}</div>
      </div>
    {/each}
  </div>

  <div class="charts">
    {#each charts as chart, ci}
      <div class="chart">
        <div class="chart-label">Chart {ci + 1}</div>
        <div class="bar-container">
          {#each chart as bar, bi}
            <div class="bar" style="height: {bar}%"></div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="progress-bars">
    {#each progress as p, i}
      <div class="progress-track">
        <div class="progress-fill" style="width: {p}%"></div>
        <span class="progress-label">Task {i + 1}: {Math.round(p)}%</span>
      </div>
    {/each}
  </div>

  {#if fps !== null}
    <div class="fps-result">FPS: {fps.toFixed(1)}</div>
  {/if}
</div>
