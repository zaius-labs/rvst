<script>
  let scrollCount = $state(0);
  let scrollY = $state(0);
  let items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);

  function handleScroll(e) {
    scrollCount += 1;
    scrollY = Math.round(e.target.scrollTop);
  }
</script>

<div>
  <div>Scrolled: {scrollCount}</div>
  <div>Offset: {scrollY}</div>
  <div style="height: 150px; overflow: auto;" onscroll={handleScroll}>
    {#each items as item}
      <div style="height: 30px;">{item}</div>
    {/each}
  </div>
</div>
