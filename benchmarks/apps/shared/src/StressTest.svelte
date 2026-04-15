<script>
  import { time, done } from './bench.js';

  const ITEMS_PER_ROUND = 2000;
  const TOTAL_ROUNDS = 10;

  let items = $state([]);
  let round = $state(0);
  let status = $state('waiting');
  let mountTimes = [];
  let unmountTimes = [];

  function generateItems(count) {
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
      out[i] = {
        id: `${round}-${i}`,
        label: `Item ${i} (round ${round + 1})`,
        color: `hsl(${(i * 137) % 360}, 70%, 60%)`,
      };
    }
    return out;
  }

  function runRound() {
    const r = round;

    const mt = time(`stress_mount_r${r + 1}`, () => {
      items = generateItems(ITEMS_PER_ROUND);
    });
    mountTimes.push(mt);

    requestAnimationFrame(() => {
      const ut = time(`stress_unmount_r${r + 1}`, () => {
        items = [];
      });
      unmountTimes.push(ut);

      round = r + 1;

      if (round < TOTAL_ROUNDS) {
        requestAnimationFrame(() => runRound());
      } else {
        finish();
      }
    });
  }

  function finish() {
    const avgMount = mountTimes.reduce((a, b) => a + b, 0) / mountTimes.length;
    const avgUnmount = unmountTimes.reduce((a, b) => a + b, 0) / unmountTimes.length;
    const throughput = (ITEMS_PER_ROUND * TOTAL_ROUNDS) / ((avgMount + avgUnmount) * TOTAL_ROUNDS / 1000);

    time('stress_avg_mount', () => {}); // logged via report
    time('stress_avg_unmount', () => {}); // logged via report

    console.log(JSON.stringify({ type: 'bench', label: 'stress_avg_mount_ms', value: avgMount }));
    console.log(JSON.stringify({ type: 'bench', label: 'stress_avg_unmount_ms', value: avgUnmount }));
    console.log(JSON.stringify({ type: 'bench', label: 'stress_throughput_items_per_sec', value: throughput }));

    status = 'done';
    done();
  }

  $effect(() => {
    status = 'running';
    requestAnimationFrame(() => runRound());
  });
</script>

<div class="stress-test">
  <h2>StressTest - {ITEMS_PER_ROUND} items x {TOTAL_ROUNDS} rounds</h2>
  <div class="stress-status">Round: {round}/{TOTAL_ROUNDS} - {status}</div>

  <div class="stress-items">
    {#each items as item (item.id)}
      <div class="stress-item" style="border-left: 3px solid {item.color}">
        <button class="stress-btn">x</button>
        <span>{item.label}</span>
      </div>
    {/each}
  </div>
</div>
