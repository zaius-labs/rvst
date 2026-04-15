<script>
  import { SvelteMap } from 'svelte/reactivity';

  // Force runes mode so Svelte compiles with push(props, true) — required for components
  // that use svelte/reactivity classes but no $state/$props runes.
  const {} = $props();

  // SvelteMap is Svelte 5's reactive Map — mutations (set/delete/clear) trigger re-renders.
  let scores = new SvelteMap([['alice', 10], ['bob', 20]]);

  function bump() {
    scores.set('alice', scores.get('alice') + 1);
  }

  function addCharlie() {
    scores.set('charlie', 0);
  }

  function removeBob() {
    scores.delete('bob');
  }
</script>
<div>
  <div>Size: {scores.size}</div>
  <div>Alice: {scores.get('alice')}</div>
  <div>Has bob: {scores.has('bob')}</div>
  <button onclick={bump}>Bump Alice</button>
  <button onclick={addCharlie}>Add Charlie</button>
  <button onclick={removeBob}>Remove Bob</button>
</div>
