<script>
  let inputEl = $state(null);
  let textareaEl = $state(null);
  let focused = $state(false);
  let refAssigned = $state(false);

  $effect(() => {
    if (inputEl !== null) refAssigned = true;
  });

  function focusInput() {
    if (inputEl) {
      inputEl.focus();
      focused = true;
    }
  }
</script>

<div>
  <input bind:this={inputEl} placeholder="Bound input" />
  <textarea bind:this={textareaEl} placeholder="Bound textarea"></textarea>
  <button onclick={focusInput}>Focus Input</button>
  <div>Ref assigned: {refAssigned}</div>
  <div>Focused: {focused}</div>
</div>
