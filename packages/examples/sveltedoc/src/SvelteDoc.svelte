<script>
  let visibility = $state('visible');
  let clickCount = $state(0);

  function handleVisibilityChange() {
    visibility = document.visibilityState ?? 'visible';
  }

  function handleDocClick() {
    clickCount++;
  }
</script>
<svelte:document onvisibilitychange={handleVisibilityChange} onclick={handleDocClick} />
<div>
  <div>Visibility: {visibility}</div>
  <div>Doc clicks: {clickCount}</div>
</div>
