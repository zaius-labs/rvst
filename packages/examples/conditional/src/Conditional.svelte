<script>
  let show = $state(true);
  let count = $state(0);
</script>

<div>
  <button onclick={() => { show = !show; }}>Toggle</button>
  <button onclick={() => { count += 1; }}>Inc</button>
  {#if show}
    <span>Visible: {count}</span>
  {:else}
    <span>Hidden</span>
  {/if}
</div>
