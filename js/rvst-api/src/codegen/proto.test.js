import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseApiSchema } from '../parser.js';
import { generateProto } from './proto.js';

describe('generateProto', () => {
  it('generates valid proto3 from schema', () => {
    const schema = parseApiSchema('users.svelte.ts', `
      import { command } from '@rvst/api';
      export interface User { id: number; name: string; email: string; }
      export const getUsers = command<{ limit: number }, User[]>();
      export const createUser = command<{ name: string; email: string }, User>();
    `);
    const proto = generateProto(schema);
    assert.ok(proto.includes('syntax = "proto3"'));
    assert.ok(proto.includes('message User'));
    assert.ok(proto.includes('double id = 1'));
    assert.ok(proto.includes('message GetUsersRequest'));
    assert.ok(proto.includes('repeated User items = 1'));
    assert.ok(proto.includes('service UsersService'));
    assert.ok(proto.includes('rpc GetUsers'));
  });

  it('handles optional fields', () => {
    const schema = parseApiSchema('config.svelte.ts', `
      export interface Config { name: string; debug?: boolean; }
    `);
    const proto = generateProto(schema);
    assert.ok(proto.includes('optional bool debug = 2'));
  });
});
