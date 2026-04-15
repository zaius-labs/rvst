import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  parseNativeDescriptor,
  generateRustFromDescriptor,
  tsTypeToRust,
  generateParallelReduce,
  generateMap,
  generateFilter,
  generateSort,
  generateHash,
} from './native-descriptor.js';

// ── parseNativeDescriptor ───────────────────────────────────────────────────

describe('parseNativeDescriptor', () => {
  it('extracts params and return type from arrow function', () => {
    const d = parseNativeDescriptor(
      `native(async (events: AnalyticsEvent[]) => EventSummary, { strategy: 'parallel-reduce' })`
    );
    assert.ok(d);
    assert.equal(d.params.length, 1);
    assert.equal(d.params[0].name, 'events');
    assert.equal(d.params[0].type, 'AnalyticsEvent[]');
    assert.equal(d.returnType, 'EventSummary');
  });

  it('extracts strategy from options object', () => {
    const d = parseNativeDescriptor(
      `native((items: string[]) => number, { strategy: 'map' })`
    );
    assert.ok(d);
    assert.equal(d.strategy, 'map');
  });

  it('defaults strategy to "default" when omitted', () => {
    const d = parseNativeDescriptor(
      `native((x: number) => string)`
    );
    assert.ok(d);
    assert.equal(d.strategy, 'default');
  });

  it('handles multiple params', () => {
    const d = parseNativeDescriptor(
      `native((a: string, b: number, c: boolean) => void)`
    );
    assert.ok(d);
    assert.equal(d.params.length, 3);
    assert.deepStrictEqual(d.params, [
      { name: 'a', type: 'string' },
      { name: 'b', type: 'number' },
      { name: 'c', type: 'boolean' },
    ]);
    assert.equal(d.returnType, 'void');
  });

  it('returns null for non-matching source', () => {
    assert.equal(parseNativeDescriptor('not a function'), null);
  });

  it('defaults type to any when omitted', () => {
    const d = parseNativeDescriptor(`native((x) => void)`);
    assert.ok(d);
    assert.equal(d.params[0].type, 'any');
  });
});

// ── tsTypeToRust ────────────────────────────────────────────────────────────

describe('tsTypeToRust', () => {
  it('maps primitives correctly', () => {
    assert.equal(tsTypeToRust('string'), 'String');
    assert.equal(tsTypeToRust('number'), 'f64');
    assert.equal(tsTypeToRust('boolean'), 'bool');
    assert.equal(tsTypeToRust('void'), '()');
    assert.equal(tsTypeToRust('Uint8Array'), 'Vec<u8>');
  });

  it('converts arrays to Vec<T>', () => {
    assert.equal(tsTypeToRust('string[]'), 'Vec<String>');
    assert.equal(tsTypeToRust('number[]'), 'Vec<f64>');
    assert.equal(tsTypeToRust('Foo[]'), 'Vec<Foo>');
  });

  it('converts nullable to Option<T>', () => {
    assert.equal(tsTypeToRust('string | null'), 'Option<String>');
    assert.equal(tsTypeToRust('number | null'), 'Option<f64>');
  });

  it('converts Record to HashMap', () => {
    assert.equal(
      tsTypeToRust('Record<string, number>'),
      'std::collections::HashMap<String, f64>'
    );
  });

  it('passes through custom types', () => {
    assert.equal(tsTypeToRust('AnalyticsEvent'), 'AnalyticsEvent');
    assert.equal(tsTypeToRust('EventSummary'), 'EventSummary');
  });
});

// ── generateRustFromDescriptor ──────────────────────────────────────────────

describe('generateRustFromDescriptor', () => {
  it('generates parallel-reduce pattern', () => {
    const d = { params: [{ name: 'events', type: 'AnalyticsEvent[]' }], returnType: 'EventSummary', strategy: 'parallel-reduce' };
    const rust = generateRustFromDescriptor(d, 'process_events');
    assert.ok(rust.includes('#[rvst::command]'));
    assert.ok(rust.includes('pub fn process_events(events: Vec<AnalyticsEvent>) -> EventSummary'));
    assert.ok(rust.includes('use rayon::prelude::*'));
    assert.ok(rust.includes('par_iter()'));
    assert.ok(rust.includes('.reduce('));
  });

  it('generates map pattern', () => {
    const d = { params: [{ name: 'items', type: 'string[]' }], returnType: 'number[]', strategy: 'map' };
    const rust = generateRustFromDescriptor(d, 'transform_items');
    assert.ok(rust.includes('pub fn transform_items(items: Vec<String>) -> Vec<f64>'));
    assert.ok(rust.includes('into_iter()'));
    assert.ok(rust.includes('.map('));
    assert.ok(rust.includes('.collect()'));
  });

  it('generates filter pattern', () => {
    const d = { params: [{ name: 'data', type: 'number[]' }], returnType: 'number[]', strategy: 'filter' };
    const rust = generateRustFromDescriptor(d, 'filter_data');
    assert.ok(rust.includes('.filter('));
    assert.ok(rust.includes('.collect()'));
  });

  it('generates sort pattern', () => {
    const d = { params: [{ name: 'vals', type: 'number[]' }], returnType: 'number[]', strategy: 'sort' };
    const rust = generateRustFromDescriptor(d, 'sort_vals');
    assert.ok(rust.includes('let mut sorted = vals'));
    assert.ok(rust.includes('sort_by('));
    assert.ok(rust.includes('partial_cmp'));
  });

  it('generates hash pattern', () => {
    const d = { params: [{ name: 'payload', type: 'Uint8Array' }], returnType: 'string', strategy: 'hash' };
    const rust = generateRustFromDescriptor(d, 'hash_payload');
    assert.ok(rust.includes('pub fn hash_payload(payload: Vec<u8>) -> String'));
    assert.ok(rust.includes('use sha2::'));
    assert.ok(rust.includes('Sha256::new()'));
  });

  it('generates default todo for unknown strategy', () => {
    const d = { params: [{ name: 'x', type: 'number' }], returnType: 'string', strategy: 'default' };
    const rust = generateRustFromDescriptor(d, 'my_fn');
    assert.ok(rust.includes('todo!("Implement my_fn")'));
  });
});
