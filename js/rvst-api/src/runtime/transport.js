// Command handler registry — JS handlers register here
const handlers = new Map();

export function registerHandler(name, fn) {
  handlers.set(name, fn);
}

// Invoke a command — routes to JS handler or Rust native
export async function invoke(name, payload, options = {}) {
  if (options.native) {
    // Call Rust handler via __host
    if (globalThis.__host?.invoke_command) {
      const json = JSON.stringify(payload);
      const result = globalThis.__host.invoke_command(name, json);
      return JSON.parse(result);
    }
    throw new Error(`Native handler '${name}' not available — no __host.invoke_command`);
  }

  // JS handler
  const handler = handlers.get(name);
  if (handler) {
    return handler(payload);
  }

  throw new Error(`No handler registered for '${name}'`);
}
