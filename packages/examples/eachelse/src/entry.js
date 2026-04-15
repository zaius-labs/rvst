// rvst harness entry point
//
// This file is the Vite lib entry instead of Counter.svelte directly.
// It exports a stable named function `rvst_mount` that the Deno host calls
// by name — no knowledge of Svelte's minified internals required.
//
// Svelte 5's public mount() API is re-exported from the bridge's index.js,
// which wraps DOM ops as Deno op calls. The bridge mount() calls the compiled
// component function with the target element.

import { mount } from 'svelte';
import Eachelse from './Eachelse.svelte';

export function rvst_mount(target) {
  return mount(Eachelse, { target });
}

export default rvst_mount;
