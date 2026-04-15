<script>
  import Child from './Child.svelte';

  let showChild = $state(false);
  let mountCount = $state(0);
  let destroyCount = $state(0);

  function handleMounted() {
    mountCount++;
  }

  function handleDestroyed() {
    destroyCount++;
  }
</script>

<div>
  <button onclick={() => showChild = !showChild}>Toggle</button>
  <div>Show: {showChild}</div>
  <div>Mounts: {mountCount}</div>
  <div>Destroys: {destroyCount}</div>
  {#if showChild}
    <Child onMounted={handleMounted} onDestroyed={handleDestroyed} />
  {/if}
</div>
