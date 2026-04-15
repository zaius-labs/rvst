import { mount } from 'svelte';
import Untrack from './Untrack.svelte';

export function rvst_mount(target) {
  return mount(Untrack, { target });
}

export default rvst_mount;
