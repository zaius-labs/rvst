import { mount } from 'svelte';
import SvelteDoc from './SvelteDoc.svelte';

export function rvst_mount(target) {
  return mount(SvelteDoc, { target });
}

export default rvst_mount;
