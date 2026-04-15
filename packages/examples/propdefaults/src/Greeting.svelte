<script>
  const { name = 'World', eager = false } = $props();
</script>

<div>
  <span>Hello, {name}!</span>
  {#if eager}
    <span>Let's go!</span>
  {/if}
</div>
