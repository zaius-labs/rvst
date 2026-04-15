<script>
  let active = $state(false);
</script>
<div>
  <button onclick={() => { active = !active; }}>Toggle</button>
  <span class:active={active} class:inactive={!active}>Status</span>
</div>
