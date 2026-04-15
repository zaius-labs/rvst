import { mount } from 'svelte';
import SvelteSetEx from './SvelteSetEx.svelte';

export function rvst_mount(target) {
  return mount(SvelteSetEx, { target });
}

export default rvst_mount;
