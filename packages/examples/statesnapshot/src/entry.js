import { mount } from 'svelte';
import StateSnapshot from './StateSnapshot.svelte';

export function rvst_mount(target) {
  return mount(StateSnapshot, { target });
}

export default rvst_mount;
