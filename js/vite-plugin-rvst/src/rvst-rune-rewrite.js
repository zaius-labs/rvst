// rvst-rune-rewrite.js
//
// Preprocessor that rewrites $rvst.query(), $rvst.mutation(), and $rvst.watch()
// calls into standard Svelte 5 runes ($state + $effect) before the Svelte
// compiler sees them.
//
// $rvst.query(name, params)    → reactive query that re-runs when params change
// $rvst.mutation(name)         → async function that calls a Rust command
// $rvst.watch(channel, params) → reactive array that accumulates streaming events
//
// invokeAsync() and __rvst_subscribe() are globals provided by rvst-quickjs
// stubs.js — no import needed.

/**
 * Rewrite $rvst.query(), $rvst.mutation(), and $rvst.watch() calls to Svelte 5 rune patterns.
 * @param {string} code - Script block content
 * @returns {string} Transformed code
 */
export function rewriteRvstRunes(code) {
  // $rvst.query('commandName', params) → $state + $effect with invokeAsync
  // Supports both single-quoted and double-quoted command names
  code = code.replace(
    /(?:const|let)\s+(\w+)\s*=\s*\$rvst\.query\(\s*(['"])([^'"]+)\2\s*,\s*(.+?)\s*\)\s*;/g,
    (_match, varName, _q, cmdName, params) => {
      return (
        `let ${varName} = $state({ data: null, loading: true, error: null });\n` +
        `$effect(() => {\n` +
        `  ${varName} = { data: null, loading: true, error: null };\n` +
        `  invokeAsync('${cmdName}', JSON.stringify(${params}))\n` +
        `    .then(r => { ${varName} = { data: JSON.parse(r), loading: false, error: null }; })\n` +
        `    .catch(e => { ${varName} = { data: null, loading: false, error: e.message || String(e) }; });\n` +
        `});`
      );
    }
  );

  // $rvst.mutation('commandName') → async wrapper around invokeAsync
  code = code.replace(
    /const\s+(\w+)\s*=\s*\$rvst\.mutation\(\s*(['"])([^'"]+)\2\s*\)\s*;/g,
    (_match, varName, _q, cmdName) => {
      return (
        `const ${varName} = async (params) => {\n` +
        `  const r = await invokeAsync('${cmdName}', JSON.stringify(params));\n` +
        `  return JSON.parse(r);\n` +
        `};`
      );
    }
  );

  // $rvst.watch('channel', params?) → $state([]) + $effect with __rvst_subscribe
  // Accumulates streaming events into a reactive array
  code = code.replace(
    /(?:const|let)\s+(\w+)\s*=\s*\$rvst\.watch\(\s*['"]([^'"]+)['"]\s*(?:,\s*(.+?))?\s*\)\s*;/g,
    (_match, varName, channel, params) => {
      const paramsJson = params ? params : '{}';
      return (
        `let ${varName} = $state([]);\n` +
        `$effect(() => {\n` +
        `  ${varName} = [];\n` +
        `  const unsub = __rvst_subscribe('${channel}', (data) => {\n` +
        `    ${varName} = [...${varName}, JSON.parse(data)];\n` +
        `  });\n` +
        `  invokeAsync('__rvst_watch_start', JSON.stringify({ channel: '${channel}', params: ${paramsJson} })).catch(() => {});\n` +
        `  return () => {\n` +
        `    unsub();\n` +
        `    invokeAsync('__rvst_watch_stop', JSON.stringify({ channel: '${channel}' })).catch(() => {});\n` +
        `  };\n` +
        `});`
      );
    }
  );

  return code;
}

/**
 * Rewrite rvst:heavy directives in a full .svelte component.
 * Scans the template for elements with `rvst:heavy`, generates async wrappers
 * with loading state, injects them into <script>, and replaces the handler reference.
 *
 * @param {string} source - Full .svelte file content
 * @returns {string} Transformed source, or original if no rvst:heavy found
 */
export function rewriteRvstHeavy(source) {
  const heavyWrappers = [];

  // Rewrite rvst:heavy in the template portion
  const rewritten = source.replace(
    /on(\w+)=\{(\w+)\}\s+rvst:heavy/g,
    (_match, event, handler) => {
      const wrapperId = `__rvst_heavy_${handler}`;
      const wrapper =
        `let __rvst_heavy_loading_${handler} = $state(false);\n` +
        `const ${wrapperId} = async (...args) => {\n` +
        `  __rvst_heavy_loading_${handler} = true;\n` +
        `  try { await invokeAsync('${handler}', JSON.stringify(args)); }\n` +
        `  finally { __rvst_heavy_loading_${handler} = false; }\n` +
        `};\n`;
      heavyWrappers.push(wrapper);
      return `on${event}={${wrapperId}}`;
    }
  );

  if (heavyWrappers.length === 0) return source;

  // Inject wrapper code at the top of the first <script> block
  const injected = heavyWrappers.join('\n');
  const result = rewritten.replace(
    /(<script[^>]*>)/,
    `$1\n${injected}`
  );

  return result;
}
