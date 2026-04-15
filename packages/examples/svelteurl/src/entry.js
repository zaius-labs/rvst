import { mount } from 'svelte';
import SvelteURL from './SvelteURL.svelte';

export function rvst_mount(target) {
  return mount(SvelteURL, { target });
}

export default rvst_mount;
