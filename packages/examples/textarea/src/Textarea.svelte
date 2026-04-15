<script>
  let notes = $state('');
</script>
<div>
  <textarea bind:value={notes} placeholder="Write notes..."></textarea>
  <span>Length: {notes.length}</span>
</div>
