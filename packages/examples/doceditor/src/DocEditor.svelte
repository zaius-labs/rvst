<script>
  import { onMount } from 'svelte';

  __rvst.disableDecorations();
</script>

<div style="display: flex; flex-direction: column; width: 100%; height: 100%;">
  <!-- Title bar -->
  <div
    style="height: 38px; background: #2d2d2d; display: flex; align-items: center; padding: 0 12px; user-select: none;"
    onmousedown={() => __rvst.startDragging()}
  >
    <div style="display: flex; gap: 8px; align-items: center;">
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f57; cursor: pointer;" onclick={() => __rvst.close()}></div>
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #febc2e; cursor: pointer;" onclick={() => __rvst.minimize()}></div>
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #28c840; cursor: pointer;" onclick={() => __rvst.maximize()}></div>
    </div>
  </div>

  <!-- Main area -->
  <div style="background: #1a1a1a; flex: 1; display: flex; justify-content: center; padding: 24px 0;">
    <div style="background: #ffffff; width: 100%; max-width: 700px; display: flex; flex-direction: column;">
      <div data-rvst-editor="true" style="flex: 1; padding: 32px;"></div>
    </div>
  </div>
</div>
