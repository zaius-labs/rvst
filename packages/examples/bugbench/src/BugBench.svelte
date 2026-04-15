<script>
  // BugBench: a UI with intentional bugs that RenderQuery should catch.
  // Each bug is toggled via state — tests run with bugs on and off.

  let showOverlay = $state(false);   // Bug 1: overlay occludes button
  let hideImportant = $state(false); // Bug 2: important text has display:none
  let clipContent = $state(false);   // Bug 3: content clipped by tiny container
  let wrongFocus = $state(false);    // Bug 4: focus on wrong element after action
  let blockClicks = $state(false);   // Bug 5: pointer-events:none on interactive element
  let zeroSize = $state(false);      // Bug 6: button has zero width

  let clicked = $state(false);

  function triggerBugs() {
    showOverlay = true;
    hideImportant = true;
    clipContent = true;
    wrongFocus = true;
    blockClicks = true;
    zeroSize = true;
  }
</script>

<div style="display: flex; flex-direction: column; gap: 8px; padding: 16px; width: 400px; height: 300px; position: relative;">
  <div>BugBench</div>
  <button onclick={triggerBugs}>Activate Bugs</button>

  <!-- Bug 1: Overlay occludes the action button -->
  <div style="position: relative;">
    <button onclick={() => clicked = true}>Action</button>
    {#if showOverlay}
      <div style="position: absolute; top: 0; left: 0; width: 200px; height: 50px; background: red;">
        Overlay
      </div>
    {/if}
  </div>

  <!-- Bug 2: Important text hidden with display:none -->
  <div style={hideImportant ? 'display: none;' : ''}>
    Important Warning
  </div>

  <!-- Bug 3: Content in tiny clipped container -->
  <div style={clipContent ? 'height: 1px; overflow: hidden;' : 'height: auto;'}>
    <div>Critical Info Line 1</div>
    <div>Critical Info Line 2</div>
  </div>

  <!-- Bug 5: Interactive element with pointer-events: none -->
  <button style={blockClicks ? 'pointer-events: none;' : ''}>
    Submit Form
  </button>

  <!-- Bug 6: Zero-width button -->
  <button style={zeroSize ? 'width: 0px; overflow: hidden;' : ''}>
    Save
  </button>

  <div>Clicked: {clicked}</div>
  <div>Bugs: {showOverlay ? 'active' : 'inactive'}</div>
</div>
