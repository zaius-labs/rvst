<script>
  let markup = $state('Hello <strong>World</strong>');
  let version = $state(1);
</script>

<div>
  <div class="content">{@html markup}</div>
  <button onclick={() => { version += 1; markup = `Version: ${version}`; }}>Update</button>
  <div>Version: {version}</div>
</div>
