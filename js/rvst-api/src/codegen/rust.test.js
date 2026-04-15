import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseApiSchema } from '../parser.js';
import { generateRust } from './rust.js';

describe('generateRust', () => {
  it('generates structs and handler trait', () => {
    const schema = parseApiSchema('users.svelte.ts', `
      import { command } from '@rvst/api';
      export interface User { id: number; name: string; email: string; }
      export const getUsers = command<{ limit: number }, User[]>();
      export const createUser = command<{ name: string; email: string }, User>();
    `);
    const rust = generateRust(schema);
    assert.ok(rust.includes('pub struct User'));
    assert.ok(rust.includes('pub id: f64'));
    assert.ok(rust.includes('pub struct GetUsersRequest'));
    assert.ok(rust.includes('pub trait UsersHandler'));
    assert.ok(rust.includes('fn get_users'));
    assert.ok(rust.includes('-> Vec<User>'));
    assert.ok(rust.includes('register_handlers'));
    assert.ok(rust.includes('rvst_quickjs::register_command'));
  });

  it('handles optional fields', () => {
    const schema = parseApiSchema('config.svelte.ts', `
      export interface Config { name: string; debug?: boolean; }
    `);
    const rust = generateRust(schema);
    assert.ok(rust.includes('pub debug: Option<bool>'));
  });
});
