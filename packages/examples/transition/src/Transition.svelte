<script>
  import { fade, slide } from 'svelte/transition';
  let show = $state(true);
  let count = $state(0);
</script>
<div>
  <button onclick={() => { show = !show; }}>Toggle</button>
  <button onclick={() => { count += 1; }}>Inc</button>
  {#if show}
    <div transition:fade>
      <span>Visible: {count}</span>
    </div>
  {:else}
    <div transition:slide>
      <span>Hidden</span>
    </div>
  {/if}
</div>
