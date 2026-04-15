<script>
  let ticks = $state(0);
  let running = $state(false);

  // setInterval — expected to FAIL: no timer mechanism in rvst Deno runtime
  let intervalId = null;

  function start() {
    if (running) return;
    running = true;
    intervalId = setInterval(() => {
      ticks += 1;
    }, 1000);
  }

  function stop() {
    running = false;
    clearInterval(intervalId);
    intervalId = null;
  }

  function reset() {
    stop();
    ticks = 0;
  }
</script>

<div>
  <div>Ticks: {ticks}</div>
  <button onclick={start}>Start</button>
  <button onclick={stop}>Stop</button>
  <button onclick={reset}>Reset</button>
</div>
