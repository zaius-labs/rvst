import { mount } from 'svelte';
import Transition from './Transition.svelte';

export function rvst_mount(target) {
  return mount(Transition, { target });
}

export default rvst_mount;
