<script>
  let { label, value, onclick } = $props();
</script>

<div>
  <span class="label">{label}</span>
  <span class="value">{value}</span>
  <button {onclick}>Bump</button>
</div>
