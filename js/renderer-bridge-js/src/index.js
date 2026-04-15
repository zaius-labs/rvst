// index.js — entry point imported by compiled Svelte output
//
// Strategy: re-export ALL of Svelte's internal/client so reactivity works
// unchanged, then explicitly override the DOM-touching exports with our
// op surface. Named exports declared here take precedence over the
// wildcard re-export from Svelte.
//
// Circular-import safety: the vite-plugin-rvst resolveId hook skips
// redirection when the importer is this file, so 'svelte/internal/client'
// below resolves to the real Svelte package.

// Re-export Svelte's full reactivity + lifecycle surface unchanged.
export * from 'svelte/internal/client';

// Override only the DOM-manipulation exports with our op surface.
// These explicit named exports shadow the same names from the wildcard above.
export {
  create_node,
  insert,
  remove,
  set_text,
  set_attr,
  listen,
  unlisten,
  queue_microtask,
  flush,
} from './renderer.js';

// mount and unmount are NOT overridden — Svelte's real implementations
// from svelte/internal/client handle component context setup (including
// legacy lifecycle: onMount, onDestroy, beforeUpdate, afterUpdate).
// The wildcard re-export above provides them.
