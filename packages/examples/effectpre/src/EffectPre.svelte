<script>
  import { untrack } from 'svelte';
  // $effect.pre() — runs before the DOM is updated (like Svelte 4's beforeUpdate).
  let count = $state(0);
  let status = $state('initial');

  $effect.pre(() => {
    // Read count to track it; update status without tracking it back.
    const c = count;
    untrack(() => {
      status = c === 0 ? 'zero' : `pre-${c}`;
    });
  });
</script>
<div>
  <div>Count: {count}</div>
  <div>Status: {status}</div>
  <button onclick={() => count++}>Increment</button>
</div>
