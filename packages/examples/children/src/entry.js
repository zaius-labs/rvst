import { mount } from 'svelte';
import Children from './Children.svelte';

export function rvst_mount(target) {
  return mount(Children, { target });
}

export default rvst_mount;
