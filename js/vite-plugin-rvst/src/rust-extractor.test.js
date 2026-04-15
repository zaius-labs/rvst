// rust-extractor.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractRustBlocks, generateBindings } from './rust-extractor.js';

describe('extractRustBlocks', () => {
  it('strips <rust> block and returns extracted code', () => {
    const input = `<script>let x = 1;</script>
<rust>
  #[rvst::command]
  pub fn greet(name: String) -> String {
    format!("Hello {name}")
  }
</rust>
<div>{x}</div>`;
    const result = extractRustBlocks(input, 'Greeting.svelte');
    assert.ok(!result.code.includes('<rust>'));
    assert.ok(!result.code.includes('pub fn greet'));
    assert.ok(result.code.includes('<script>let x = 1;</script>'));
    assert.ok(result.code.includes('<div>{x}</div>'));
    assert.equal(result.rustBlocks.length, 1);
    assert.equal(result.rustBlocks[0].componentName, 'Greeting');
    assert.ok(result.rustBlocks[0].rustCode.includes('pub fn greet'));
  });

  it('handles multiple rust blocks', () => {
    const input = `<rust>\npub fn a() {}\n</rust>\n<div />\n<rust>\npub fn b() {}\n</rust>`;
    const result = extractRustBlocks(input, 'Multi.svelte');
    assert.equal(result.rustBlocks.length, 2);
    assert.ok(result.rustBlocks[0].rustCode.includes('pub fn a'));
    assert.ok(result.rustBlocks[1].rustCode.includes('pub fn b'));
    assert.ok(!result.code.includes('<rust>'));
    assert.ok(result.code.includes('<div />'));
  });

  it('returns code unchanged when no rust blocks present', () => {
    const input = `<script>let x = 42;</script>\n<p>Hello</p>`;
    const result = extractRustBlocks(input, 'Plain.svelte');
    assert.equal(result.code, input);
    assert.equal(result.rustBlocks.length, 0);
  });

  it('derives componentName from filename path', () => {
    const result = extractRustBlocks('<rust>code</rust>', '/some/deep/path/MyWidget.svelte');
    assert.equal(result.rustBlocks[0].componentName, 'MyWidget');
  });
});

describe('generateBindings', () => {
  it('generates invokeAsync for a single-param command', () => {
    const rust = `#[rvst::command]\npub fn process_image(path: String) -> ProcessResult {\n  do_thing()\n}`;
    const bindings = generateBindings(rust);
    assert.ok(bindings.includes("process_image"));
    assert.ok(bindings.includes("invokeAsync('process_image'"));
  });

  it('generates invokeAsync for zero-param command', () => {
    const rust = `#[rvst::command]\npub fn get_status() -> Status {\n  Status::ok()\n}`;
    const bindings = generateBindings(rust);
    assert.ok(bindings.includes("get_status"));
    assert.ok(bindings.includes("invokeAsync('get_status', '{}')"));
  });

  it('generates invokeAsync for multi-param command', () => {
    const rust = `#[rvst::command]\npub fn resize(width: u32, height: u32) -> Dimensions {\n  todo!()\n}`;
    const bindings = generateBindings(rust);
    assert.ok(bindings.includes("resize"));
    assert.ok(bindings.includes("width"));
    assert.ok(bindings.includes("height"));
  });

  it('skips non-command annotations', () => {
    const rust = `#[rvst::watch]\npub fn on_change(path: String) -> () {}`;
    const bindings = generateBindings(rust);
    assert.equal(bindings, '');
  });

  it('handles multiple commands', () => {
    const rust = `#[rvst::command]\npub fn create(name: String) -> Item {}\n\n#[rvst::command]\npub fn delete(id: u64) -> bool {}`;
    const bindings = generateBindings(rust);
    assert.ok(bindings.includes("const create"));
    assert.ok(bindings.includes("const delete"));
  });

  it('skips &self and callback params', () => {
    const rust = `#[rvst::command]\npub fn run(&self, data: String, cb: impl Fn(i32)) -> () {}`;
    const bindings = generateBindings(rust);
    assert.ok(bindings.includes("const run"));
    assert.ok(bindings.includes("data"));
    assert.ok(!bindings.includes("self"));
    assert.ok(!bindings.includes("impl Fn"));
  });

  it('returns empty string for no commands', () => {
    const bindings = generateBindings('pub fn helper() {}');
    assert.equal(bindings, '');
  });
});
