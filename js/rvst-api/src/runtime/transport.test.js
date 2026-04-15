import { describe, it } from 'node:test';
import assert from 'node:assert';
import { invoke, registerHandler } from './transport.js';

describe('transport', () => {
  it('invokes registered JS handler', async () => {
    registerHandler('echo', (payload) => ({ echoed: payload.msg }));
    const result = await invoke('echo', { msg: 'hello' });
    assert.deepEqual(result, { echoed: 'hello' });
  });

  it('throws for unregistered handler', async () => {
    await assert.rejects(() => invoke('nonexistent', {}), /No handler/);
  });

  it('throws for native without __host', async () => {
    await assert.rejects(() => invoke('native_cmd', {}, { native: true }), /not available/);
  });
});
