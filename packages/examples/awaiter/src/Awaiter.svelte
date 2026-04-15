<script>
  // {#await} — renders pending/then/catch states of a promise.
  let promise = $state(Promise.resolve('hello'));
  let pendingPromise = $state(new Promise(() => {})); // never resolves

  function reset() {
    promise = Promise.resolve('world');
  }

  function showError() {
    // Create rejected promise inline — the {#await} catch branch handles it.
    promise = new Promise((_, reject) => reject(new Error('oops')));
  }
</script>
<div>
  {#await promise}
    <div>Loading...</div>
  {:then value}
    <div>Resolved: {value}</div>
  {:catch err}
    <div>Caught: {err.message}</div>
  {/await}

  {#await pendingPromise}
    <div>Pending</div>
  {:then _}
    <div>Done</div>
  {/await}

  <button onclick={reset}>Reset</button>
  <button onclick={showError}>Show Error</button>
</div>
