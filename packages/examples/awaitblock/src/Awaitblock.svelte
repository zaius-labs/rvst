<script>
  let promise = $state(Promise.resolve('loaded'));
  let refreshCount = $state(0);

  function refresh() {
    refreshCount++;
    promise = Promise.resolve(`refresh ${refreshCount}`);
  }

  function fail() {
    promise = Promise.reject(new Error('fetch failed'));
  }
</script>

<div>
  {#await promise}
    <span>Loading...</span>
  {:then value}
    <span>Result: {value}</span>
  {:catch error}
    <span>Error: {error.message}</span>
  {/await}
  <button onclick={refresh}>Refresh</button>
  <button onclick={fail}>Fail</button>
  <div>Refreshes: {refreshCount}</div>
</div>
