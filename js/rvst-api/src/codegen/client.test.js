import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseApiSchema } from '../parser.js';
import { generateClient } from './client.js';

describe('generateClient', () => {
  it('generates query for get* commands', () => {
    const schema = parseApiSchema('users.svelte.ts', `
      import { command } from '@rvst/api';
      export interface User { id: number; }
      export const getUsers = command<{ limit: number }, User[]>();
    `);
    const code = generateClient(schema);
    assert.ok(code.includes("export const getUsers"));
    assert.ok(code.includes("query('getUsers'"));
  });

  it('generates mutation for non-get commands', () => {
    const schema = parseApiSchema('users.svelte.ts', `
      import { command } from '@rvst/api';
      export interface User { id: number; }
      export const createUser = command<{ name: string }, User>();
    `);
    const code = generateClient(schema);
    assert.ok(code.includes("mutation('createUser'"));
  });

  it('passes native option', () => {
    const schema = parseApiSchema('compute.svelte.ts', `
      import { command } from '@rvst/api';
      export const compute = command<{ data: string }, string>({ native: true });
    `);
    const code = generateClient(schema);
    assert.ok(code.includes("{ native: true }"));
  });
});
