<script>
  let name = $state('');
  let email = $state('');
  let focused = $state('none');
</script>

<div>
  <input placeholder="Name" bind:value={name} onfocus={() => focused = 'name'} />
  <input placeholder="Email" bind:value={email} onfocus={() => focused = 'email'} />
  <button onclick={() => focused = 'submit'}>Submit</button>
  <div>Focused: {focused}</div>
  <div>Name: {name}</div>
  <div>Email: {email}</div>
</div>
