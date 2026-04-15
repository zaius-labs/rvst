<script>
  let pings = $state(0);
  let resets = $state(0);
  let status = $state('idle');

  function ping() {
    pings += 1;
    status = pings % 2 === 0 ? 'even' : 'odd';
  }

  function reset() {
    resets += 1;
    pings = 0;
    status = 'reset';
  }
</script>

<div>
  <button onclick={ping}>Ping</button>
  <button onclick={reset}>Reset</button>
  <div>Pings: {pings}</div>
  <div>Resets: {resets}</div>
  <div>Status: {status}</div>
</div>
