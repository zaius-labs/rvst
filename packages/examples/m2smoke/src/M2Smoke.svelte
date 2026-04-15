<script>
  let todos = $state([]);
  let newTodo = $state('');
  let totalAdded = $state(0);

  function addTodo() {
    if (newTodo.trim()) {
      todos = [...todos, { text: newTodo.trim(), done: false }];
      totalAdded++;
      newTodo = '';
    }
  }

  function removeTodo(i) {
    todos = todos.filter((_, j) => j !== i);
  }

  function toggleTodo(i) {
    todos = todos.map((t, j) => j === i ? { ...t, done: !t.done } : t);
  }

  let activeCount = $derived(todos.filter(t => !t.done).length);
</script>

<div style="display: flex; flex-direction: column; padding: 16px; gap: 12px; max-width: 400px;">
  <div>M2 Smoke Test</div>
  <div style="display: flex; gap: 8px;">
    <input placeholder="New todo" bind:value={newTodo} />
    <button onclick={addTodo}>Add</button>
  </div>
  <div>Active: {activeCount} | Total added: {totalAdded}</div>
  <div style="height: 200px; overflow: auto;">
    {#each todos as todo, i}
      <div style="display: flex; gap: 8px; padding: 4px 0;">
        <button onclick={() => toggleTodo(i)}>{todo.done ? '[x]' : '[ ]'}</button>
        <span>{todo.text}</span>
        <button onclick={() => removeTodo(i)}>x</button>
      </div>
    {/each}
  </div>
  <div>Chars: {newTodo.length}</div>
</div>
