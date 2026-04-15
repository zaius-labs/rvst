<script>
  let score = $state(50);
  function inc() { score = Math.min(100, score + 10); }
  function dec() { score = Math.max(0, score - 10); }
</script>

<div>
  {#if score >= 90}
    <span>Excellent</span>
  {:else if score >= 70}
    <span>Good</span>
  {:else if score >= 50}
    <span>Pass</span>
  {:else}
    <span>Fail</span>
  {/if}
  <div>Score: {score}</div>
  <button onclick={inc}>+10</button>
  <button onclick={dec}>-10</button>
</div>
