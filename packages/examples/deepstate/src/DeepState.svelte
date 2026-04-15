<script>
  let user = $state({ name: 'Alice', score: 0, tags: [] });

  function increment() { user.score++; }
  function rename() { user.name = 'Bob'; }
  function addTag() { user.tags.push('new'); }
</script>

<div>
  <div>Name: {user.name}</div>
  <div>Score: {user.score}</div>
  <div>Tags: {user.tags.length}</div>
  <button onclick={increment}>Increment</button>
  <button onclick={rename}>Rename</button>
  <button onclick={addTag}>Add Tag</button>
</div>
