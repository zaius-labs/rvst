<script>
  let fruits = $state(['apple', 'banana', 'cherry']);

  function addFig() {
    fruits.push('fig');
  }

  function removeLast() {
    fruits.pop();
  }
</script>
<div>
  {#each fruits as fruit, i}
    <div>{i}: {fruit}</div>
  {/each}
  <div>Total: {fruits.length}</div>
  <button onclick={addFig}>Add Fig</button>
  <button onclick={removeLast}>Remove Last</button>
</div>
