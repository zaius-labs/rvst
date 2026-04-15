// renderer.js — bridges Svelte renderer calls to Rust ops via Deno.core.ops
// Falls back to console.log when running outside the Deno host (e.g. node/browser testing)

const ops = globalThis.Deno?.core?.ops ?? null;

function callOp(name, ...args) {
  if (ops?.[name]) {
    ops[name](...args);
  } else {
    console.log(`[bridge] ${name}`, ...args);
  }
}

export function create_node(id, type) {
  callOp('op_create_node', id, type);
}

export function insert(parentId, childId, anchor) {
  callOp('op_insert', parentId, childId, anchor ?? 0);
}

export function remove(id) {
  callOp('op_remove', id);
}

export function set_text(id, value) {
  callOp('op_set_text', id, value);
}

export function set_attr(id, key, value) {
  callOp('op_set_attr', id, key, value);
}

export function listen(id, event, handlerId) {
  callOp('op_listen', id, event, handlerId);
}

export function unlisten(id, event, handlerId) {
  callOp('op_unlisten', id, event, handlerId);
}

export function queue_microtask(fn) {
  globalThis.queueMicrotask(fn);
}

export function flush() {
  callOp('op_flush');
}
