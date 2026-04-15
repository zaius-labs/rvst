<script>
  import Card from './Card.svelte';

  let title = $state('Hello Card');
</script>

<div>
  <Card>
    {#snippet header()}
      <span>Header: {title}</span>
    {/snippet}
    {#snippet body()}
      <span>Body content</span>
    {/snippet}
  </Card>
  <button onclick={() => title = 'Updated'}>Update Title</button>
</div>
