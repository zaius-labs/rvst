<script>
  let active = $state(false);
  let status = $state('idle');

  $effect(() => {
    if (active) {
      status = 'started';
      return () => {
        status = 'cleaned up';
      };
    }
  });
</script>

<div>
  <div>Status: {status}</div>
  <button onclick={() => active = !active}>Toggle</button>
</div>
