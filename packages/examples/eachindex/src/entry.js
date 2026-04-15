import { mount } from 'svelte';
import EachIndex from './EachIndex.svelte';

export function rvst_mount(target) {
  return mount(EachIndex, { target });
}

export default rvst_mount;
