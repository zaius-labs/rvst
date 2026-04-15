<script>
  const { label, children = [] } = $props();
</script>
<div>
  <span>{label}</span>
  {#each children as child}
    <svelte:self label={child.label} children={child.children ?? []} />
  {/each}
</div>
