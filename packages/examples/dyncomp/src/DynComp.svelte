<script>
  import CompA from './CompA.svelte';
  import CompB from './CompB.svelte';

  let which = $state('A');
  let DynComponent = $derived(which === 'A' ? CompA : CompB);

  function switchComp() { which = which === 'A' ? 'B' : 'A'; }
</script>

<div>
  <DynComponent />
  <button onclick={switchComp}>Switch</button>
  <div>Active: {which}</div>
</div>
