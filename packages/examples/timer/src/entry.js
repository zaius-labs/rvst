import { mount } from 'svelte';
import Timer from './Timer.svelte';

export function rvst_mount(target) {
  return mount(Timer, { target });
}

export default rvst_mount;
