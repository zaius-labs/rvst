<script>
  import { SvelteDate } from 'svelte/reactivity';
  // Force runes mode (needed for svelte/reactivity).
  const {} = $props();
  // SvelteDate — reactive Date object whose methods trigger re-renders.
  const date = new SvelteDate(2026, 0, 1); // Jan 1, 2026

  function advance() {
    date.setMonth(date.getMonth() + 1);
  }
</script>
<div>
  <div>Year: {date.getFullYear()}</div>
  <div>Month: {date.getMonth()}</div>
  <button onclick={advance}>Next Month</button>
</div>
