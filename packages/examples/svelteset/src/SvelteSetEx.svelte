<script>
  import { SvelteSet } from 'svelte/reactivity';

  const {} = $props();  // force runes mode

  let tags = new SvelteSet(['alpha', 'beta']);

  function addGamma() {
    tags.add('gamma');
  }

  function removeAlpha() {
    tags.delete('alpha');
  }
</script>
<div>
  <div>Size: {tags.size}</div>
  <div>Has alpha: {tags.has('alpha')}</div>
  <div>Has gamma: {tags.has('gamma')}</div>
  <button onclick={addGamma}>Add Gamma</button>
  <button onclick={removeAlpha}>Remove Alpha</button>
</div>
