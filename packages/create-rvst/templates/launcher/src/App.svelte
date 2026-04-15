<script>
  // ── Raycast-style command launcher ────────────────────────────────────
  let query = $state("");
  let selected = $state(0);

  const commands = [
    { id: "apps",     label: "Applications",      desc: "Open an application",          icon: "\uF416", shortcut: "" },
    { id: "files",    label: "File Search",        desc: "Find files on your system",    icon: "\uF3EB", shortcut: "⌘F" },
    { id: "calc",     label: "Calculator",         desc: "Quick math calculations",      icon: "\uF31A", shortcut: "" },
    { id: "clip",     label: "Clipboard History",  desc: "Paste from clipboard history", icon: "\uF503", shortcut: "⌘⇧V" },
    { id: "snippets", label: "Snippets",           desc: "Insert saved text snippets",   icon: "\uF4A8", shortcut: "" },
    { id: "window",   label: "Window Management",  desc: "Resize and move windows",      icon: "\uF31C", shortcut: "" },
    { id: "term",     label: "Terminal",           desc: "Run shell commands",           icon: "\uF3EB", shortcut: "" },
    { id: "notes",    label: "Quick Note",         desc: "Create a new note",            icon: "\uF416", shortcut: "⌘N" },
    { id: "colors",   label: "Color Picker",       desc: "Pick a color from screen",     icon: "\uF31A", shortcut: "" },
    { id: "emoji",    label: "Emoji Picker",       desc: "Search and paste emojis",      icon: "\uF503", shortcut: "⌘." },
    { id: "system",   label: "System Preferences", desc: "Open system settings",         icon: "\uF31C", shortcut: "" },
    { id: "lock",     label: "Lock Screen",        desc: "Lock your computer",           icon: "\uF4A8", shortcut: "⌘⇧Q" },
  ];

  let filtered = $derived(
    query.trim()
      ? commands.filter(c =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.desc.toLowerCase().includes(query.toLowerCase())
        )
      : commands
  );

  $effect(() => {
    // Reset selection when filter changes
    filtered.length;
    selected = 0;
  });

  function onKeydown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selected = Math.min(selected + 1, filtered.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selected = Math.max(selected - 1, 0);
    } else if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      execute(filtered[selected]);
    } else if (e.key === "Escape") {
      globalThis.__rvst?.close();
    }
  }

  function execute(cmd) {
    // In a real launcher, this would open the app/run the command
    // For now, just show what was selected
    query = "";
  }

  // Disable window chrome, start frameless
  $effect(() => {
    globalThis.__rvst?.disableDecorations();
  });

  const startDrag = (e) => {
    if (!e.target.closest("button") && !e.target.closest("input")) {
      globalThis.__rvst?.startDragging();
    }
  };
</script>

<svelte:window onkeydown={onKeydown} />

<div class="launcher" onmousedown={startDrag}>
  <div class="search-row">
    <span class="search-icon">{"\uF4A8"}</span>
    <input
      class="search-input"
      type="text"
      placeholder="Search commands..."
      bind:value={query}
      aria-label="Search"
    />
    <span class="shortcut-hint">esc</span>
  </div>

  <div class="results">
    {#each filtered as cmd, i}
      <button
        class="result-item {selected === i ? 'selected' : ''}"
        onclick={() => execute(cmd)}
        onmouseenter={() => selected = i}
      >
        <span class="result-icon">{cmd.icon}</span>
        <div class="result-text">
          <span class="result-label">{cmd.label}</span>
          <span class="result-desc">{cmd.desc}</span>
        </div>
        {#if cmd.shortcut}
          <span class="result-shortcut">{cmd.shortcut}</span>
        {/if}
      </button>
    {/each}
    {#if filtered.length === 0}
      <div class="no-results">No results for "{query}"</div>
    {/if}
  </div>

  <div class="footer">
    <span class="footer-hint">↑↓ navigate</span>
    <span class="footer-hint">↵ open</span>
    <span class="footer-hint">esc close</span>
  </div>
</div>

<style>
  :global(html), :global(body), :global(body > *) {
    height: auto; margin: 0; padding: 0;
    background: transparent;
  }

  .launcher {
    width: 580px;
    background-color: #1e1e2e;
    border: 1px solid #313244;
    border-radius: 12px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #cdd6f4;
  }

  .search-row {
    display: flex; flex-direction: row; align-items: center; gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid #313244;
  }
  .search-icon {
    font-family: "Phosphor"; font-size: 18px; color: #6c7086;
    width: 18px; min-width: 18px;
  }
  .search-input {
    flex-grow: 1; flex-shrink: 1; flex-basis: auto;
    background: none; border: none; outline: none;
    font-size: 16px; color: #cdd6f4;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .search-input::placeholder { color: #585b70; }
  .shortcut-hint {
    font-size: 11px; color: #585b70;
    background-color: #313244; border-radius: 4px;
    padding: 2px 6px;
  }

  .results {
    display: flex; flex-direction: column;
    max-height: 400px; overflow-y: auto;
    padding: 4px;
  }
  .result-item {
    display: flex; flex-direction: row; align-items: center; gap: 12px;
    padding: 10px 12px; border: none; background: none;
    cursor: pointer; border-radius: 8px; text-align: left;
    width: 100%;
  }
  .result-item:hover, .selected { background-color: #313244; }
  .result-icon {
    font-family: "Phosphor"; font-size: 20px; color: #89b4fa;
    width: 24px; min-width: 24px;
    display: flex; align-items: center; justify-content: center;
  }
  .result-text {
    display: flex; flex-direction: column; gap: 2px; flex: 1;
  }
  .result-label {
    font-size: 14px; font-weight: 500; color: #cdd6f4;
  }
  .result-desc {
    font-size: 12px; color: #6c7086;
  }
  .result-shortcut {
    font-size: 11px; color: #585b70;
    background-color: #313244; border-radius: 4px;
    padding: 2px 8px; white-space: nowrap;
  }
  .no-results {
    padding: 20px; text-align: center; color: #585b70; font-size: 13px;
  }

  .footer {
    display: flex; flex-direction: row; align-items: center; gap: 16px;
    padding: 8px 16px;
    border-top: 1px solid #313244;
    background-color: #181825;
  }
  .footer-hint {
    font-size: 11px; color: #585b70;
  }
</style>
