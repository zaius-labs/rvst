// rvst harness entry point — bits-ui Tabs example
//
// Exports a stable named function `rvst_mount` that the Deno host calls
// by name. Exercises bits-ui Tabs which stresses MutationObserver,
// ResizeObserver, aria attributes, focus management, and keyboard events.

import { mount } from 'svelte';
import App from './App.svelte';

export function rvst_mount(target) {
  return mount(App, { target });
}

export default rvst_mount;
