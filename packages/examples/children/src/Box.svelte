<script>
  const { children, title = 'Box' } = $props();
</script>
<div>
  <div>Title: {title}</div>
  <div>{@render children()}</div>
</div>
