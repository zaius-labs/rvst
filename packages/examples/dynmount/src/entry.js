import { mount } from 'svelte';
import DynMount from './DynMount.svelte';

export function rvst_mount(target) {
  return mount(DynMount, { target });
}

export default rvst_mount;
