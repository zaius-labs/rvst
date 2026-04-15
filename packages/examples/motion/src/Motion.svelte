<script>
  // Animate a value using requestAnimationFrame — tests rAF stub in headless env.
  // Uses $state + rAF directly (no svelte/motion) so it works in runes mode.
  let progress = $state(0);
  let animating = $state(false);
  let frameCount = $state(0);

  function animateTo(target) {
    const start = progress;
    const diff = target - start;
    const startTime = performance.now();
    const duration = 200;
    animating = true;

    function step(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      progress = Math.round((start + diff * t) * 100);
      frameCount += 1;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        animating = false;
      }
    }
    requestAnimationFrame(step);
  }
</script>
<div>
  <button onclick={() => animateTo(1)}>To 100</button>
  <button onclick={() => animateTo(0)}>Reset</button>
  <div>Progress: {progress}</div>
  <div>Frames: {frameCount}</div>
  <div>Animating: {animating}</div>
</div>
