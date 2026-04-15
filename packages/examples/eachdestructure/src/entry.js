import { mount } from 'svelte';
import EachDestructure from './EachDestructure.svelte';

export function rvst_mount(target) {
  return mount(EachDestructure, { target });
}

export default rvst_mount;
