<script>
  let name = $state('');
  let submitted = $state(false);
  let submittedName = $state('');

  function handleSubmit(e) {
    e.preventDefault();
    submittedName = name;
    submitted = true;
  }
</script>
<div>
  {#if submitted}
    <div>Submitted: {submittedName}</div>
    <button onclick={() => { submitted = false; name = ''; }}>Reset</button>
  {:else}
    <form onsubmit={handleSubmit}>
      <input bind:value={name} placeholder="Your name" />
      <button type="submit">Submit</button>
    </form>
    <div>Status: idle</div>
  {/if}
</div>
