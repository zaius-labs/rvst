<script>
  let count = $state(0);
</script>

<div class="app">
  <h1>Hello from RVST</h1>
  <p>A native desktop engine for Svelte</p>
  <button onclick={() => count++}>
    Clicked {count} {count === 1 ? 'time' : 'times'}
  </button>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background-color: #1e1e2e;
    color: #cdd6f4;
  }
  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
  p {
    font-size: 14px;
    color: #6c7086;
    margin: 0;
  }
  button {
    padding: 10px 20px;
    border-radius: 8px;
    background-color: #89b4fa;
    color: #1e1e2e;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
</style>
