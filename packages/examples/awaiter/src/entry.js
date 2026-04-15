import { mount } from 'svelte';
import Awaiter from './Awaiter.svelte';

export function rvst_mount(target) {
  return mount(Awaiter, { target });
}

export default rvst_mount;
