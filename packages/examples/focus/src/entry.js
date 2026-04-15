import { mount } from 'svelte';
import Focus from './Focus.svelte';

export function rvst_mount(target) {
  return mount(Focus, { target });
}

export default rvst_mount;
