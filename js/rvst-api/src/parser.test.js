import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseApiSchema } from './parser.js';

describe('parseApiSchema', () => {
  it('extracts interfaces as messages', () => {
    const schema = parseApiSchema('test.svelte.ts', `
      export interface User {
        id: number;
        name: string;
        email: string;
      }
    `);
    assert.equal(schema.messages.length, 1);
    assert.equal(schema.messages[0].name, 'User');
    assert.equal(schema.messages[0].fields.length, 3);
    assert.equal(schema.messages[0].fields[0].type, 'number');
  });

  it('extracts command() calls', () => {
    const schema = parseApiSchema('test.svelte.ts', `
      import { command } from '@rvst/api';
      export interface User { id: number; name: string; }
      export const getUsers = command<{ limit: number }, User[]>();
    `);
    assert.equal(schema.commands.length, 1);
    assert.equal(schema.commands[0].name, 'getUsers');
    assert.equal(schema.commands[0].native, false);
  });

  it('detects native: true option', () => {
    const schema = parseApiSchema('test.svelte.ts', `
      import { command } from '@rvst/api';
      export const compute = command<{ data: string }, string>({ native: true });
    `);
    assert.equal(schema.commands[0].native, true);
  });

  it('extracts optional fields', () => {
    const schema = parseApiSchema('test.svelte.ts', `
      export interface Config {
        name: string;
        debug?: boolean;
      }
    `);
    assert.equal(schema.messages[0].fields[1].optional, true);
  });

  it('extracts array types as repeated', () => {
    const schema = parseApiSchema('test.svelte.ts', `
      export interface Team {
        members: string[];
      }
    `);
    assert.equal(schema.messages[0].fields[0].repeated, true);
    assert.equal(schema.messages[0].fields[0].type, 'string');
  });
});
