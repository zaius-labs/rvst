import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCommands, generateCapabilityDts, CAPABILITY_MAP } from './capabilities.js';

describe('resolveCommands', () => {
  it('resolves a single capability to its commands', () => {
    const cmds = resolveCommands(['fs:read']);
    assert.deepStrictEqual(cmds, ['fs_read', 'fs_read_text', 'fs_list', 'fs_stat', 'fs_exists']);
  });

  it('resolves multiple capabilities and deduplicates', () => {
    const cmds = resolveCommands(['fs:read', 'fs:write', 'crypto']);
    assert.ok(cmds.includes('fs_read'));
    assert.ok(cmds.includes('fs_write'));
    assert.ok(cmds.includes('crypto_hash'));
    // no duplicates
    assert.strictEqual(cmds.length, new Set(cmds).size);
  });

  it('returns empty array for unknown capabilities', () => {
    const cmds = resolveCommands(['unknown:thing', 'also:fake']);
    assert.deepStrictEqual(cmds, []);
  });

  it('handles empty input', () => {
    const cmds = resolveCommands([]);
    assert.deepStrictEqual(cmds, []);
  });
});

describe('generateCapabilityDts', () => {
  it('produces valid TypeScript with fs:read namespace', () => {
    const dts = generateCapabilityDts(['fs:read']);
    assert.ok(dts.includes('declare const rvst'));
    assert.ok(dts.includes('fs: {'));
    assert.ok(dts.includes('read(path: string): Promise<Uint8Array>'));
    assert.ok(dts.includes('readText(path: string): Promise<string>'));
  });

  it('merges multiple capabilities into the same namespace', () => {
    const dts = generateCapabilityDts(['fs:read', 'fs:write']);
    // Both read and write methods under the fs namespace
    assert.ok(dts.includes('read(path: string): Promise<Uint8Array>'));
    assert.ok(dts.includes('write(path: string, data: Uint8Array): Promise<void>'));
    // Should only have one fs namespace block
    const fsCount = (dts.match(/fs: \{/g) || []).length;
    assert.strictEqual(fsCount, 1);
  });

  it('produces separate namespaces for different capabilities', () => {
    const dts = generateCapabilityDts(['fs:read', 'net:fetch', 'crypto']);
    assert.ok(dts.includes('fs: {'));
    assert.ok(dts.includes('net: {'));
    assert.ok(dts.includes('crypto: {'));
  });

  it('produces minimal output with no capabilities', () => {
    const dts = generateCapabilityDts([]);
    assert.ok(dts.includes('declare const rvst'));
    // No namespace blocks
    assert.ok(!dts.includes('fs: {'));
    assert.ok(!dts.includes('net: {'));
  });

  it('includes interface definitions', () => {
    const dts = generateCapabilityDts(['fs:read']);
    assert.ok(dts.includes('interface FileEntry'));
    assert.ok(dts.includes('interface FileStat'));
  });
});

describe('CAPABILITY_MAP', () => {
  it('has all expected capability keys', () => {
    const keys = Object.keys(CAPABILITY_MAP);
    assert.ok(keys.includes('fs:read'));
    assert.ok(keys.includes('fs:write'));
    assert.ok(keys.includes('fs:watch'));
    assert.ok(keys.includes('net:fetch'));
    assert.ok(keys.includes('crypto'));
    assert.ok(keys.includes('compress'));
    assert.ok(keys.includes('serial'));
    assert.ok(keys.includes('clipboard'));
  });

  it('every entry has commands array and tsApi', () => {
    for (const [key, val] of Object.entries(CAPABILITY_MAP)) {
      assert.ok(Array.isArray(val.commands), `${key} missing commands`);
      assert.ok(val.tsApi, `${key} missing tsApi`);
      assert.ok(typeof val.tsApi.namespace === 'string', `${key} missing tsApi.namespace`);
      assert.ok(Array.isArray(val.tsApi.methods), `${key} missing tsApi.methods`);
    }
  });
});
