<script>
  import TrafficLights from "./TrafficLights.svelte";
  import hljs from "highlight.js/lib/core";
  import javascript from "highlight.js/lib/languages/javascript";
  import typescript from "highlight.js/lib/languages/typescript";
  import css from "highlight.js/lib/languages/css";
  import json from "highlight.js/lib/languages/json";
  import xml from "highlight.js/lib/languages/xml";
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("xml", xml);

  let activeFile = $state("src/App.svelte");
  let openTabs = $state(["src/App.svelte", "src/Counter.svelte"]);
  let expandedFolders = $state({ "src/": true, "styles/": false });
  let modifiedFiles = $state(new Set());

  const fileTree = [
    { name: "src/", type: "folder", indent: 0 },
    { name: "src/App.svelte", type: "file", label: "App.svelte", indent: 1 },
    { name: "src/Counter.svelte", type: "file", label: "Counter.svelte", indent: 1 },
    { name: "src/utils.ts", type: "file", label: "utils.ts", indent: 1 },
    { name: "styles/", type: "folder", indent: 0 },
    { name: "styles/global.css", type: "file", label: "global.css", indent: 1 },
    { name: "package.json", type: "file", label: "package.json", indent: 0 },
    { name: "vite.config.js", type: "file", label: "vite.config.js", indent: 0 },
  ];

  let fileContents = $state({
    "src/App.svelte": [
      "\x3Cscript>",
      '  import Counter from "./Counter.svelte";',
      "",
      '  let title = $state("My RVST App");',
      "  let darkMode = $state(true);",
      "",
      "  function toggleTheme() {",
      "    darkMode = !darkMode;",
      "  }",
      "\x3C/script>",
      "",
      '\x3Cmain class="{darkMode ? \'dark\' : \'light\'}">',
      "  \x3Ch1>{title}\x3C/h1>",
      "  \x3CCounter initial={0} />",
      "  \x3Cbutton onclick={toggleTheme}>",
      '    {darkMode ? "Light" : "Dark"}',
      "  \x3C/button>",
      "\x3C/main>",
      "",
      "\x3Cstyle>",
      "  main {",
      "    padding: 2rem;",
      "    font-family: system-ui, sans-serif;",
      "  }",
      "\x3C/style>",
    ].join("\n"),
    "src/Counter.svelte": [
      "\x3Cscript>",
      "  let { initial = 0 } = $props();",
      "  let count = $state(initial);",
      "",
      "  function increment() { count += 1; }",
      "  function decrement() { if (count > 0) count -= 1; }",
      "  function reset() { count = initial; }",
      "\x3C/script>",
      "",
      '\x3Cdiv class="counter">',
      '  \x3Cspan class="display">{count}\x3C/span>',
      '  \x3Cdiv class="controls">',
      "    \x3Cbutton onclick={decrement}>-\x3C/button>",
      "    \x3Cbutton onclick={increment}>+\x3C/button>",
      "    \x3Cbutton onclick={reset}>reset\x3C/button>",
      "  \x3C/div>",
      "\x3C/div>",
    ].join("\n"),
    "src/utils.ts": "export function clamp(val: number, min: number, max: number): number {\n  return Math.min(Math.max(val, min), max);\n}\n\nexport function debounce(fn: Function, ms: number = 300) {\n  let timer: ReturnType\x3Ctypeof setTimeout>;\n  return (...args: any[]) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}",
    "styles/global.css": ":root {\n  --bg: #1e1e2e;\n  --fg: #cdd6f4;\n  --accent: #89b4fa;\n}\n\n* { margin: 0; padding: 0; box-sizing: border-box; }\n\nbody {\n  background: var(--bg);\n  color: var(--fg);\n}",
    "package.json": '{\n  "name": "my-rvst-app",\n  "version": "0.1.0",\n  "type": "module",\n  "scripts": {\n    "dev": "rvst dev",\n    "build": "rvst build"\n  },\n  "dependencies": {\n    "svelte": "^5.0.0"\n  }\n}',
    "vite.config.js": 'import { defineConfig } from "vite";\nimport { svelte } from "@sveltejs/vite-plugin-svelte";\n\nexport default defineConfig({\n  plugins: [svelte()],\n  build: {\n    outDir: "dist",\n  },\n});',
  });

  function langFor(f) {
    if (f.endsWith(".svelte")) return "xml";
    if (f.endsWith(".ts")) return "typescript";
    if (f.endsWith(".css")) return "css";
    if (f.endsWith(".json")) return "json";
    return "javascript";
  }

  function tokenize(html) {
    const tokens = [];
    let i = 0;
    while (i < html.length) {
      if (html[i] === '<') {
        const closeTag = html.indexOf('>', i);
        if (closeTag < 0) break;
        const tag = html.slice(i, closeTag + 1);
        const cm = tag.match(/class="([^"]+)"/);
        const cls = cm ? cm[1] : "";
        const endSpan = html.indexOf('</span>', closeTag);
        if (endSpan < 0) break;
        const inner = html.slice(closeTag + 1, endSpan);
        const text = inner.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&#(\d+);/g,(_,c)=>String.fromCharCode(c));
        tokens.push({ text, cls });
        i = endSpan + 7;
      } else {
        const next = html.indexOf('<', i);
        const raw = next < 0 ? html.slice(i) : html.slice(i, next);
        const text = raw.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&#(\d+);/g,(_,c)=>String.fromCharCode(c));
        if (text) tokens.push({ text, cls: "" });
        i = next < 0 ? html.length : next;
      }
    }
    return tokens.length ? tokens : [{ text: " ", cls: "" }];
  }

  let tokenizedLines = $derived.by(() => {
    const code = fileContents[activeFile] || "";
    if (!code) return [];
    const result = hljs.highlight(code, { language: langFor(activeFile) });
    return result.value.split("\n").map(line => tokenize(line));
  });

  function toggleFolder(name) { expandedFolders[name] = !expandedFolders[name]; }
  function isExpanded(folderName) { return expandedFolders[folderName]; }

  function openFile(name) {
    activeFile = name;
    if (!openTabs.includes(name)) openTabs = [...openTabs, name];
  }
  function closeTab(name) {
    openTabs = openTabs.filter(t => t !== name);
    if (activeFile === name) activeFile = openTabs.length > 0 ? openTabs[openTabs.length - 1] : "";
  }
  function tabLabel(name) { return name.split("/").pop(); }

  $effect(() => { globalThis.__rvst?.disableDecorations(); });
  const startDrag = (e) => {
    if (!e.target.closest("button")) globalThis.__rvst?.startDragging();
  };
</script>

<div class="shell">
  <div class="titlebar" onmousedown={startDrag} role="banner">
    <TrafficLights />
    <span class="win-title">{activeFile ? tabLabel(activeFile) : "RVST Editor"} — RVST Editor</span>
    <div class="titlebar-spacer"></div>
  </div>

  <div class="body">
    <div class="sidebar">
      <div class="sidebar-label">EXPLORER</div>
      <div class="file-tree">
        {#each fileTree as item (item.name)}
          {#if item.type === "folder"}
            <button class="tree-item folder" style="padding-left: {12 + item.indent * 16}px" onclick={() => toggleFolder(item.name)}>
              <span class="folder-arrow">{expandedFolders[item.name] ? "\uF31A" : "\uF31C"}</span>
              <span class="folder-icon">{"\uF416"}</span>
              <span class="tree-label">{item.name}</span>
            </button>
          {:else if item.indent === 0 || isExpanded(item.name.split("/")[0] + "/")}
            <button class="tree-item file {activeFile === item.name ? 'active' : ''}" style="padding-left: {12 + item.indent * 16}px" onclick={() => openFile(item.name)}>
              <span class="file-icon">{"\uF3EB"}</span>
              <span class="tree-label">{item.label}</span>
            </button>
          {/if}
        {/each}
      </div>
    </div>

    <div class="editor-area">
      <div class="tab-bar">
        {#each openTabs as tab}
          <button class="tab {activeFile === tab ? 'active' : ''}" onclick={() => activeFile = tab}>
            <span class="tab-name">{tabLabel(tab)}{modifiedFiles.has(tab) ? " \u25CF" : ""}</span>
            <span class="tab-close" onclick={(e) => { e.stopPropagation(); closeTab(tab); }}>&times;</span>
          </button>
        {/each}
      </div>

      <div class="code-area">
        {#if activeFile && tokenizedLines.length > 0}
          <div class="code-viewer">
            {#each tokenizedLines as tokens, i}
              <div class="code-row">
                <span class="line-num">{i + 1}</span>
                <span class="line-code">{#each tokens as tok}{#if tok.cls}<span class={tok.cls}>{tok.text}</span>{:else}{tok.text}{/if}{/each}</span>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-editor"><span class="empty-msg">Select a file to edit</span></div>
        {/if}
      </div>

      <div class="terminal-panel">
        <div class="terminal-tab-bar">
          <span class="terminal-tab active">TERMINAL</span>
          <span class="terminal-tab">PROBLEMS</span>
          <span class="terminal-tab">OUTPUT</span>
        </div>
        <div class="terminal-content">
          <div class="term-line"><span class="term-prompt">$</span> <span class="term-cmd">rvst dev</span></div>
          <div class="term-line"><span class="term-info">[rvst]</span> <span class="term-text">starting dev server...</span></div>
          <div class="term-line"><span class="term-info">[rvst]</span> <span class="term-text">compiled src/App.svelte</span></div>
          <div class="term-line"><span class="term-info">[rvst]</span> <span class="term-text">compiled src/Counter.svelte</span></div>
          <div class="term-line"><span class="term-success">[rvst]</span> <span class="term-text">built in 218ms</span></div>
          <div class="term-line"><span class="term-info">[rvst]</span> <span class="term-text">watching for changes...</span></div>
          <div class="term-line"><span class="term-prompt">$</span> <span class="term-blink">|</span></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .shell { display: flex; flex-direction: column; width: 100%; height: 100%; font-family: "SF Mono", "Fira Code", monospace; font-size: 13px; background-color: #1e1e2e; color: #cdd6f4; }
  .titlebar { display: flex; flex-direction: row; align-items: center; height: 38px; min-height: 38px; background-color: #181825; border-bottom: 1px solid #313244; padding-right: 12px; }
  .win-title { flex: 1; text-align: center; font-size: 12px; color: #6c7086; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .titlebar-spacer { width: 68px; }
  .body { display: flex; flex-direction: row; flex: 1; overflow: hidden; }
  .sidebar { display: flex; flex-direction: column; width: 220px; min-width: 220px; background-color: #181825; border-right: 1px solid #313244; }
  .sidebar-label { font-size: 11px; font-weight: 700; color: #585b70; letter-spacing: 0.1em; padding: 10px 12px 6px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .file-tree { display: flex; flex-direction: column; overflow-y: auto; flex: 1; }
  .tree-item { display: flex; flex-direction: row; align-items: center; gap: 6px; background: none; border: none; color: #a6adc8; font-size: 13px; padding: 4px 12px; cursor: pointer; text-align: left; width: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .tree-item:hover { background-color: #1e1e2e; }
  .tree-item.active { background-color: #313244; color: #cdd6f4; }
  .folder-arrow { font-family: "Phosphor"; font-size: 12px; width: 12px; min-width: 12px; color: #585b70; }
  .folder-icon { font-family: "Phosphor"; font-size: 15px; color: #f9e2af; }
  .file-icon { font-family: "Phosphor"; font-size: 15px; color: #89b4fa; margin-left: 16px; }
  .tree-label { white-space: nowrap; }
  .editor-area { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
  .tab-bar { display: flex; flex-direction: row; background-color: #181825; border-bottom: 1px solid #313244; min-height: 35px; max-height: 35px; }
  .tab { display: flex; flex-direction: row; align-items: center; gap: 8px; padding: 0 16px; background-color: #181825; border: none; border-right: 1px solid #313244; color: #6c7086; font-size: 12px; cursor: pointer; white-space: nowrap; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .tab.active { background-color: #1e1e2e; color: #cdd6f4; }
  .tab-close { font-size: 14px; color: #45475a; cursor: pointer; border-radius: 3px; padding: 0 2px; }
  .tab-close:hover { color: #cdd6f4; background-color: #45475a; }
  .code-area { flex: 1; overflow-y: auto; background-color: #1e1e2e; }
  .code-viewer { display: flex; flex-direction: column; padding: 8px 0; }
  .code-row { display: flex; flex-direction: row; font-size: 13px; line-height: 20px; }
  .line-num { width: 48px; min-width: 48px; text-align: right; padding-right: 16px; color: #45475a; }
  .line-code { display: flex; flex-direction: row; flex: 1; white-space: nowrap; color: #cdd6f4; }
  :global(.hljs-keyword) { color: #cba6f7; }
  :global(.hljs-built_in) { color: #fab387; }
  :global(.hljs-type) { color: #89dceb; }
  :global(.hljs-literal) { color: #fab387; }
  :global(.hljs-number) { color: #fab387; }
  :global(.hljs-string) { color: #a6e3a1; }
  :global(.hljs-comment) { color: #6c7086; }
  :global(.hljs-title) { color: #89b4fa; }
  :global(.hljs-attr) { color: #89dceb; }
  :global(.hljs-tag) { color: #89b4fa; }
  :global(.hljs-name) { color: #89b4fa; }
  :global(.hljs-meta) { color: #fab387; }
  :global(.hljs-property) { color: #89dceb; }
  :global(.hljs-variable) { color: #f38ba8; }
  .empty-editor { display: flex; align-items: center; justify-content: center; flex: 1; }
  .empty-msg { color: #45475a; font-size: 14px; }
  .terminal-panel { display: flex; flex-direction: column; height: 150px; min-height: 150px; border-top: 1px solid #313244; background-color: #11111b; }
  .terminal-tab-bar { display: flex; flex-direction: row; align-items: center; background-color: #181825; border-bottom: 1px solid #313244; min-height: 30px; padding: 0 12px; gap: 16px; }
  .terminal-tab { font-size: 11px; font-weight: 600; color: #45475a; letter-spacing: 0.04em; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 6px 0; }
  .terminal-tab.active { color: #cdd6f4; border-bottom: 1px solid #89b4fa; margin-bottom: -1px; }
  .terminal-content { flex: 1; overflow-y: auto; padding: 8px 16px; font-size: 12px; }
  .term-line { display: flex; flex-direction: row; line-height: 1.7; white-space: nowrap; }
  .term-prompt { color: #a6e3a1; font-weight: 700; }
  .term-cmd { color: #cdd6f4; }
  .term-info { color: #89b4fa; }
  .term-success { color: #a6e3a1; }
  .term-text { color: #a6adc8; }
  .term-blink { color: #cdd6f4; }
</style>
