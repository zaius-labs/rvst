/**
 * RVST Web Renderer Bridge
 * Routes Svelte DOM operations to the WASM-compiled rendering engine.
 *
 * Usage: import and call initRvst(canvas) before mounting Svelte app.
 */

let engine = null;

/**
 * Initialize the WASM rendering engine.
 * Must be called before any Svelte component mounts.
 */
export async function initRvst(canvas, wasmUrl) {
  // Dynamic import of the WASM module
  const wasm = await import(wasmUrl || './rvst_web_bg.wasm');
  await wasm.default(); // Initialize WASM

  engine = new wasm.RvstEngine(canvas.width, canvas.height);
  await engine.init_gpu(canvas);

  // Initialize command registry
  if (wasm.init_commands) wasm.init_commands();

  // Expose for command invocation
  globalThis.__rvst_wasm = {
    invoke_command: wasm.invoke_command,
    invoke_command_async: wasm.invoke_command_async,
    grant_capability: wasm.grant_capability,
  };

  return engine;
}

// --- DOM Operation Bridge ---
// These replace the __host.op_* calls used in the desktop QuickJS bridge.

let nextId = 1;

export function createElement(tag) {
  const id = nextId++;
  if (engine) engine.create_node(id, tag || 'div');
  return id;
}

export function createTextNode(text) {
  const id = nextId++;
  if (engine) engine.create_text_node(id, text);
  return id;
}

export function setText(id, text) {
  if (engine) engine.set_text(id, text);
}

export function setAttribute(id, key, value) {
  if (engine) engine.set_attribute(id, key, value);
}

export function setStyle(id, property, value) {
  if (engine) engine.set_style(id, property, value);
}

export function insertBefore(parentId, childId, anchorId) {
  if (engine) engine.insert(parentId, childId, anchorId || 0);
}

export function removeChild(id) {
  if (engine) engine.remove(id);
}

export function addEventListener(id, event, callback) {
  // Store callback reference for event dispatch from WASM
  if (!eventListeners[id]) eventListeners[id] = {};
  if (!eventListeners[id][event]) eventListeners[id][event] = [];
  eventListeners[id][event].push(callback);
  if (engine) engine.listen(id, event);
}

export function removeEventListener(id, event, callback) {
  const listeners = eventListeners[id]?.[event];
  if (listeners) {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  }
}

export function flush() {
  if (engine) engine.render();
}

// Event listener storage (WASM calls back into JS via these)
const eventListeners = {};

/**
 * Called by WASM when an event occurs on a node.
 * The WASM hit-testing determines which node was clicked/focused/etc.
 */
export function dispatchEvent(nodeId, eventType, payload) {
  const listeners = eventListeners[nodeId]?.[eventType];
  if (listeners) {
    const event = new Event(eventType);
    Object.assign(event, payload ? JSON.parse(payload) : {});
    for (const cb of listeners) {
      cb(event);
    }
  }
}

// Make dispatch available to WASM
globalThis.__rvst_dispatch_event = dispatchEvent;
