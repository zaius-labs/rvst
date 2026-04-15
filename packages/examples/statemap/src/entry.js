import { mount } from 'svelte';
import StateMap from './StateMap.svelte';

export function rvst_mount(target) {
  return mount(StateMap, { target });
}

export default rvst_mount;
