<script>
  let lastKey = $state('none');
  let lastBeforeInput = $state('none');
  let lastInput = $state('none');

  function onKeyDown(e) {
    lastKey = e.key;
  }
  function onBeforeInput(e) {
    lastBeforeInput = e.inputType + ':' + (e.data || '');
  }
  function onInput(e) {
    lastInput = e.inputType + ':' + (e.data || '');
  }
</script>

<div
  contenteditable="true"
  onkeydown={onKeyDown}
  onbeforeinput={onBeforeInput}
  oninput={onInput}
  style="width: 400px; height: 200px; border: 1px solid black; padding: 8px; font-size: 16px;"
>Hello</div>
<div>key:{lastKey}</div>
<div>beforeinput:{lastBeforeInput}</div>
<div>input:{lastInput}</div>
