import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { processFile, findApiFiles } from './index.js';

describe('rvstApiPlugin', () => {
  it('generates files from .svelte.ts', () => {
    const tmpDir = '/tmp/rvst-codegen-test';
    const apiDir = path.join(tmpDir, 'src', 'api');
    fs.mkdirSync(apiDir, { recursive: true });

    // Write a test schema
    fs.writeFileSync(path.join(apiDir, 'todos.svelte.ts'), `
      import { command } from '@rvst/api';
      export interface Todo { id: number; text: string; done: boolean; }
      export const getTodos = command<{}, Todo[]>();
      export const addTodo = command<{ text: string }, Todo>();
    `);

    // Process it
    processFile(path.join(apiDir, 'todos.svelte.ts'), tmpDir);

    // Verify outputs
    assert.ok(fs.existsSync(path.join(apiDir, 'todos.gen.js')), 'gen.js should exist');
    assert.ok(fs.existsSync(path.join(apiDir, 'todos.proto')), 'proto should exist');

    const genJs = fs.readFileSync(path.join(apiDir, 'todos.gen.js'), 'utf-8');
    assert.ok(genJs.includes('getTodos'), 'gen.js should have getTodos');
    assert.ok(genJs.includes('addTodo'), 'gen.js should have addTodo');

    const proto = fs.readFileSync(path.join(apiDir, 'todos.proto'), 'utf-8');
    assert.ok(proto.includes('message Todo'), 'proto should have Todo message');

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('generates Rust for native commands', () => {
    const tmpDir = '/tmp/rvst-codegen-test-native';
    const apiDir = path.join(tmpDir, 'src', 'api');
    fs.mkdirSync(apiDir, { recursive: true });

    fs.writeFileSync(path.join(apiDir, 'compute.svelte.ts'), `
      import { command } from '@rvst/api';
      export const heavyWork = command<{ data: string }, string>({ native: true });
    `);

    processFile(path.join(apiDir, 'compute.svelte.ts'), tmpDir);

    assert.ok(fs.existsSync(path.join(tmpDir, 'src-native', 'compute.gen.rs')), 'gen.rs should exist');

    const genRs = fs.readFileSync(path.join(tmpDir, 'src-native', 'compute.gen.rs'), 'utf-8');
    assert.ok(genRs.includes('ComputeHandler'), 'should have handler trait');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
