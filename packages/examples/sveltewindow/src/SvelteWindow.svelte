<script>
  let lastKey = $state('none');
  let ctrl = $state(false);
  let width = $state(0);

  function handleKey(e) {
    lastKey = e.key;
    ctrl = e.ctrlKey ?? false;
  }

  function handleResize(e) {
    width = window.innerWidth;
  }
</script>

<svelte:window onkeydown={handleKey} onresize={handleResize} />

<div>
  <div>Last key: {lastKey}</div>
  <div>Ctrl: {ctrl}</div>
  <div>Width: {width}</div>
</div>
