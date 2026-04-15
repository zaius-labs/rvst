import { mount } from 'svelte';
import StateRaw from './StateRaw.svelte';

export function rvst_mount(target) {
  return mount(StateRaw, { target });
}

export default rvst_mount;
