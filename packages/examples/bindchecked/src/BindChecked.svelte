<script>
  // bind:checked — two-way boolean binding on a checkbox.
  let accepted = $state(false);
  let subscribed = $state(true);
</script>
<div>
  <label>
    <input type="checkbox" bind:checked={accepted} />
    Accept terms
  </label>
  <label>
    <input type="checkbox" bind:checked={subscribed} />
    Subscribe
  </label>
  <div>Accepted: {accepted}</div>
  <div>Subscribed: {subscribed}</div>
  {#if accepted}
    <div>Terms accepted!</div>
  {/if}
</div>
