import { mount } from 'svelte';
import SvelteDate from './SvelteDate.svelte';

export function rvst_mount(target) {
  return mount(SvelteDate, { target });
}

export default rvst_mount;
