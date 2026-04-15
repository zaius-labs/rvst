<script>
  import Greeting from './Greeting.svelte';

  let useDefault = $state(true);
  let eager = $state(false);
</script>

<div>
  {#if useDefault}
    <Greeting />
  {:else}
    <Greeting name="Alice" {eager} />
  {/if}
  <button onclick={() => useDefault = false}>Override</button>
  <button onclick={() => eager = true}>Set Eager</button>
</div>
