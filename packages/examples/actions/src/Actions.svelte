<script>
  let active = $state(false);
  let marked = $state(false);

  // A Svelte action: sets data-marked on mount, removes on destroy
  function mark(node) {
    node.setAttribute('data-marked', 'true');
    marked = true;
    return {
      destroy() {
        node.removeAttribute('data-marked');
        marked = false;
      }
    };
  }
</script>

<div>
  <span use:mark data-testid="target">Target</span>
  <div>Marked: {marked}</div>
  <button onclick={() => active = !active}>Toggle</button>
  <div>Active: {active}</div>
</div>
