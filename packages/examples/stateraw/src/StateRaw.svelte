<script>
  // $state.raw() creates a non-reactive value — mutations do NOT trigger re-renders.
  // Only reassignment of the variable itself triggers reactivity.
  let count = $state(0);
  let rawLog = $state.raw([]);

  function increment() {
    count++;
    // Mutate rawLog in place — this does NOT trigger reactivity (no re-render for rawLog)
    rawLog.push(count);
  }

  function resetLog() {
    // Reassign rawLog — this DOES trigger reactivity
    rawLog = [];
  }
</script>
<div>
  <div>Count: {count}</div>
  <div>LogLen: {rawLog.length}</div>
  <button onclick={increment}>Increment</button>
  <button onclick={resetLog}>Reset Log</button>
</div>
