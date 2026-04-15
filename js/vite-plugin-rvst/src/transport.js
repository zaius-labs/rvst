/**
 * Unified transport layer — routes command invocations to the appropriate runtime.
 * Desktop: __host.invoke_command (QuickJS)
 * Web: __rvst_wasm.invoke_command (WASM)
 * Fallback: JS handlers
 */

const handlers = new Map();

export function registerHandler(name, fn) {
  handlers.set(name, fn);
}

export async function invoke(name, payload) {
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);

  // Desktop: QuickJS host
  if (globalThis.__host?.invoke_command) {
    return JSON.parse(globalThis.__host.invoke_command(name, payloadStr));
  }

  // Web: WASM module
  if (globalThis.__rvst_wasm?.invoke_command) {
    const result = await globalThis.__rvst_wasm.invoke_command_async(name, payloadStr);
    return JSON.parse(result);
  }

  // JS handler fallback
  const handler = handlers.get(name);
  if (handler) return await handler(JSON.parse(payloadStr));

  throw new Error(`No handler for command '${name}' — neither native, WASM, nor JS handler registered`);
}

export async function invokeAsync(name, payload) {
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);

  // Desktop: async command
  if (globalThis.invokeAsync) {
    return globalThis.invokeAsync(name, payloadStr);
  }

  // Web: WASM async
  if (globalThis.__rvst_wasm?.invoke_command_async) {
    return globalThis.__rvst_wasm.invoke_command_async(name, payloadStr);
  }

  // Fallback to sync invoke
  return invoke(name, payload);
}

/**
 * Detect the current runtime environment.
 */
export function detectRuntime() {
  if (globalThis.__host?.invoke_command) return 'desktop';
  if (globalThis.__rvst_wasm?.invoke_command) return 'wasm';
  return 'js';
}
