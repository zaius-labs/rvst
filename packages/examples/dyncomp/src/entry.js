import { mount } from 'svelte';
import DynComp from './DynComp.svelte';

export function rvst_mount(target) {
  return mount(DynComp, { target });
}

export default rvst_mount;
