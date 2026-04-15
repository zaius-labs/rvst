<script>
  let name = $state('');
</script>

<div>
  <input bind:value={name} placeholder="Your name" />
  <span>{name ? `Hello, ${name}!` : 'Enter your name'}</span>
</div>
