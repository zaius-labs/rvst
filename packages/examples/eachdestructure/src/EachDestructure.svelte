<script>
  // {#each} with object destructuring — destructures items inline.
  let people = $state([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Carol', age: 35 },
  ]);

  function addPerson() {
    people.push({ name: 'Dave', age: 28 });
  }
</script>
<div>
  {#each people as { name, age }}
    <div>{name}: {age}</div>
  {/each}
  <div>Total: {people.length}</div>
  <button onclick={addPerson}>Add</button>
</div>
