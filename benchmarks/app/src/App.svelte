<script>
  import { writeResults } from './lib/harness.js';
  import { generateDataset } from './lib/dataset.js';
  import { runColdStart } from './lib/workloads/cold-start.js';
  import { runComputeStress } from './lib/workloads/compute-stress.js';
  import { runIpcStress } from './lib/workloads/ipc-stress.js';
  import DataExplorer from './DataExplorer.svelte';

  const ROW_COUNT = 1000;
  let explorerReady = false;
  let dataset = null;
  let searchFn = null;
  let sortFn = null;

  function onReady(fns) {
    explorerReady = true;
    // fns contains { search, sort } from DataExplorer
    searchFn = fns?.search;
    sortFn = fns?.sort;

    // Run workloads
    runColdStart();

    // Generate larger dataset for compute stress
    dataset = generateDataset(ROW_COUNT);
    runComputeStress(dataset);

    runIpcStress();

    // Write all results
    writeResults();
  }
</script>

<div class="root">
  <DataExplorer rowCount={ROW_COUNT} {onReady} />
</div>

<style>
  .root {
    width: 100%;
    height: 100%;
  }
</style>
