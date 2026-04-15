<script>
  const close    = () => globalThis.__rvst?.close();
  const minimize = () => globalThis.__rvst?.minimize();
  const maximize = () => globalThis.__rvst?.maximize();
</script>

<div class="lights">
  <button class="dot red"    onclick={close}    aria-label="Close"></button>
  <button class="dot yellow" onclick={minimize} aria-label="Minimize"></button>
  <button class="dot green"  onclick={maximize} aria-label="Maximize"></button>
</div>

<style>
  .lights {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding-left: 12px;
  }
  .dot {
    width: 12px;
    height: 12px;
    min-width: 12px;
    min-height: 12px;
    border-radius: 50%;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    font-size: 0;
    line-height: 0;
    box-sizing: border-box;
  }
  .red    { background-color: #ff5f57; }
  .yellow { background-color: #febc2e; }
  .green  { background-color: #28c840; }
</style>
