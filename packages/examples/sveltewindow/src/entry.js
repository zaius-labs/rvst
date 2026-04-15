import { mount } from 'svelte';
import SvelteWindow from './SvelteWindow.svelte';

export function rvst_mount(target) {
  return mount(SvelteWindow, { target });
}

export default rvst_mount;
