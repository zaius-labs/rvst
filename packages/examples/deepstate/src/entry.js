import { mount } from 'svelte';
import DeepState from './DeepState.svelte';

export function rvst_mount(target) {
  return mount(DeepState, { target });
}

export default rvst_mount;
