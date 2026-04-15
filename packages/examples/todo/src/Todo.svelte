<script>
  let todos = $state(['Buy milk', 'Ship rvst', 'Fix bugs']);

  function add() {
    todos = [...todos, `Todo ${todos.length + 1}`];
  }

  function remove(i) {
    todos = todos.filter((_, j) => j !== i);
  }
</script>

<div class="app">
  <h2 class="title">Todo List</h2>
  <div class="list">
    {#each todos as todo, i}
      <div class="item">
        <span class="text">{todo}</span>
        <button class="remove-btn" onclick={() => remove(i)}>Remove</button>
      </div>
    {/each}
  </div>
  <button class="add-btn" onclick={add}>+ Add</button>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 16px;
    font-family: sans-serif;
    max-width: 480px;
  }

  .title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 6px;
    background: #2a2a3a;
  }

  .text {
    flex: 1;
    font-size: 15px;
  }

  .remove-btn {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 13px;
    background: #6b2d2d;
    color: #fff;
  }

  .add-btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    background: #2d5a6b;
    color: #fff;
    align-self: flex-start;
  }
</style>
