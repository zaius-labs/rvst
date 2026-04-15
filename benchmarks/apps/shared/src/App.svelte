<script>
  import { done } from './bench.js';
  import DataTable from './DataTable.svelte';

  function tableDone() {
    done();
  }
</script>

<div class="app">
  <DataTable ondone={tableDone} />
</div>

<style>
  .app {
    width: 100%;
    height: 100%;
    background: #1e1e2e;
  }
</style>
