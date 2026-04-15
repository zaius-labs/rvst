<script>
  let content = $state('<strong>Hello</strong> <em>world</em>');
  let plain = $state('plain text');

  function setRich() {
    content = '<strong>Bold</strong> and <em>italic</em>';
  }

  function setSimple() {
    content = '<span>simple</span>';
  }
</script>
<div>
  <div>{@html content}</div>
  <div>{plain}</div>
  <button onclick={setRich}>Set Rich</button>
  <button onclick={setSimple}>Set Simple</button>
</div>
