import { mount } from 'svelte';
import OnMount from './OnMount.svelte';

export function rvst_mount(target) {
  return mount(OnMount, { target });
}

export default rvst_mount;
