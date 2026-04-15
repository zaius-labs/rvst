// rvst-rune-rewrite.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rewriteRvstRunes, rewriteRvstHeavy } from './rvst-rune-rewrite.js';

describe('rewriteRvstRunes', () => {
  it('rewrites $rvst.query with literal params', () => {
    const input = `const todos = $rvst.query('getTodos', {});`;
    const result = rewriteRvstRunes(input);
    assert.ok(result.includes(`let todos = $state({ data: null, loading: true, error: null });`));
    assert.ok(result.includes(`$effect(() => {`));
    assert.ok(result.includes(`invokeAsync('getTodos', JSON.stringify({}))`));
    assert.ok(!result.includes('const todos'));
  });

  it('rewrites $rvst.query with reactive variable params', () => {
    const input = `let items = $rvst.query('search', { term: searchTerm });`;
    const result = rewriteRvstRunes(input);
    assert.ok(result.includes(`let items = $state({ data: null, loading: true, error: null });`));
    assert.ok(result.includes(`invokeAsync('search', JSON.stringify({ term: searchTerm }))`));
    assert.ok(result.includes(`$effect(() => {`));
  });

  it('rewrites $rvst.mutation to async function', () => {
    const input = `const addTodo = $rvst.mutation('addTodo');`;
    const result = rewriteRvstRunes(input);
    assert.ok(result.includes(`const addTodo = async (params) => {`));
    assert.ok(result.includes(`invokeAsync('addTodo', JSON.stringify(params))`));
    assert.ok(result.includes(`JSON.parse(r)`));
  });

  it('returns code unchanged when no $rvst calls present', () => {
    const input = `const x = 42;\nlet name = $state('hello');`;
    const result = rewriteRvstRunes(input);
    assert.equal(result, input);
  });

  it('rewrites multiple $rvst calls in one script', () => {
    const input = [
      `const todos = $rvst.query('getTodos', {});`,
      `const users = $rvst.query('getUsers', { role: 'admin' });`,
      `const addTodo = $rvst.mutation('addTodo');`,
      `const deleteUser = $rvst.mutation('deleteUser');`,
    ].join('\n');
    const result = rewriteRvstRunes(input);
    assert.ok(result.includes(`invokeAsync('getTodos'`));
    assert.ok(result.includes(`invokeAsync('getUsers'`));
    assert.ok(result.includes(`invokeAsync('addTodo'`));
    assert.ok(result.includes(`invokeAsync('deleteUser'`));
    assert.ok(!result.includes('$rvst'));
  });

  it('supports double-quoted command names', () => {
    const input = `const data = $rvst.query("fetchData", { id: 1 });`;
    const result = rewriteRvstRunes(input);
    assert.ok(result.includes(`invokeAsync('fetchData'`));
    assert.ok(!result.includes('$rvst'));
  });

  it('rewrites $rvst.watch with params', () => {
    const input = `const logs = $rvst.watch('log_stream', { level: 'info' });`;
    const result = rewriteRvstRunes(input);
    assert.ok(result.includes(`let logs = $state([]);`));
    assert.ok(!result.includes('const logs'));
    assert.ok(result.includes(`$effect(() => {`));
    assert.ok(result.includes(`__rvst_subscribe('log_stream'`));
    assert.ok(result.includes(`JSON.parse(data)`));
    assert.ok(!result.includes('$rvst'));
  });

  it('rewrites $rvst.watch without params', () => {
    const input = `let events = $rvst.watch('system_events');`;
    const result = rewriteRvstRunes(input);
    assert.ok(result.includes(`let events = $state([]);`));
    assert.ok(result.includes(`__rvst_subscribe('system_events'`));
    assert.ok(!result.includes('$rvst'));
  });

  it('$rvst.watch cleanup unsubscribes and stops watcher', () => {
    const input = `const metrics = $rvst.watch('perf_metrics', { interval: 1000 });`;
    const result = rewriteRvstRunes(input);
    assert.ok(result.includes(`return () => {`));
    assert.ok(result.includes(`unsub()`));
    assert.ok(result.includes(`__rvst_watch_stop`));
  });
});

describe('rewriteRvstHeavy', () => {
  it('generates async wrapper with loading state for rvst:heavy button', () => {
    const input = [
      '<script>',
      '  function processData() { /* ... */ }',
      '</script>',
      '<button onclick={processData} rvst:heavy>Process</button>',
    ].join('\n');
    const result = rewriteRvstHeavy(input);

    // Wrapper injected into <script>
    assert.ok(result.includes('let __rvst_heavy_loading_processData = $state(false);'));
    assert.ok(result.includes('const __rvst_heavy_processData = async (...args) => {'));
    assert.ok(result.includes("await invokeAsync('processData', JSON.stringify(args))"));
    assert.ok(result.includes('__rvst_heavy_loading_processData = true;'));
    assert.ok(result.includes('__rvst_heavy_loading_processData = false;'));

    // Template handler replaced
    assert.ok(result.includes('onclick={__rvst_heavy_processData}'));
    // Directive removed
    assert.ok(!result.includes('rvst:heavy'));
  });

  it('generates unique wrappers for multiple rvst:heavy directives', () => {
    const input = [
      '<script>',
      '  function encode() {}',
      '  function decode() {}',
      '</script>',
      '<button onclick={encode} rvst:heavy>Encode</button>',
      '<button onclick={decode} rvst:heavy>Decode</button>',
    ].join('\n');
    const result = rewriteRvstHeavy(input);

    // Both wrappers present
    assert.ok(result.includes('const __rvst_heavy_encode = async'));
    assert.ok(result.includes('const __rvst_heavy_decode = async'));
    assert.ok(result.includes('let __rvst_heavy_loading_encode = $state(false);'));
    assert.ok(result.includes('let __rvst_heavy_loading_decode = $state(false);'));

    // Both handlers replaced
    assert.ok(result.includes('onclick={__rvst_heavy_encode}'));
    assert.ok(result.includes('onclick={__rvst_heavy_decode}'));
    assert.ok(!result.includes('rvst:heavy'));
  });

  it('returns source unchanged when no rvst:heavy present', () => {
    const input = '<script>let x = 1;</script>\n<button onclick={x}>Click</button>';
    const result = rewriteRvstHeavy(input);
    assert.equal(result, input);
  });

  it('works with non-click events', () => {
    const input = [
      '<script>',
      '  function handleInput() {}',
      '</script>',
      '<input oninput={handleInput} rvst:heavy />',
    ].join('\n');
    const result = rewriteRvstHeavy(input);
    assert.ok(result.includes('oninput={__rvst_heavy_handleInput}'));
    assert.ok(result.includes("await invokeAsync('handleInput'"));
  });
});
