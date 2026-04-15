<script>
  import { registerHandler } from '@rvst/api/runtime';
  import * as todosHandler from './api/todos.handler.js';

  // Register JS handlers
  registerHandler('getTodos', todosHandler.getTodos);
  registerHandler('addTodo', todosHandler.addTodo);
  registerHandler('toggleTodo', todosHandler.toggleTodo);

  // Import generated client (from codegen)
  // For now, use the runtime directly since codegen runs at build time
  import { query, mutation } from '@rvst/api/runtime';

  let todos = $state([]);
  let newText = $state('');

  async function loadTodos() {
    const result = await query('getTodos', {}).then(r => r);
    todos = result.data || [];
  }

  async function addTodo() {
    if (!newText.trim()) return;
    await mutation('addTodo', { text: newText }).call();
    newText = '';
    await loadTodos();
  }

  async function toggle(id) {
    await mutation('toggleTodo', { id }).call();
    await loadTodos();
  }

  // Load on mount
  $effect(() => { loadTodos(); });
</script>

<div class="app">
  <div class="header">Todo App — @rvst/api Demo</div>

  <div class="input-row">
    <input
      type="text"
      bind:value={newText}
      placeholder="Add a todo..."
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
    />
    <button onclick={addTodo}>Add</button>
  </div>

  <div class="todos">
    {#each todos as todo (todo.id)}
      <div class="todo" class:done={todo.done}>
        <button onclick={() => toggle(todo.id)} class="toggle">
          {todo.done ? '✓' : '○'}
        </button>
        <span>{todo.text}</span>
      </div>
    {/each}
  </div>

  <div class="count">{todos.length} todos</div>
</div>

<style>
  .app {
    background: #1e1e2e;
    color: #cdd6f4;
    font-family: system-ui;
    width: 100%;
    height: 100%;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .header {
    font-size: 20px;
    font-weight: 700;
    color: #89b4fa;
  }
  .input-row {
    display: flex;
    gap: 8px;
  }
  input {
    flex: 1;
    padding: 8px 12px;
    background: #313244;
    border: 1px solid #45475a;
    border-radius: 6px;
    color: #cdd6f4;
    font-size: 14px;
  }
  button {
    padding: 8px 16px;
    background: #89b4fa;
    color: #1e1e2e;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }
  .todos {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .todo {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #313244;
    border-radius: 6px;
  }
  .todo.done span {
    text-decoration: line-through;
    color: #6c7086;
  }
  .toggle {
    background: none;
    border: none;
    color: #a6e3a1;
    font-size: 16px;
    padding: 0 4px;
    cursor: pointer;
  }
  .count {
    font-size: 12px;
    color: #6c7086;
  }
</style>
