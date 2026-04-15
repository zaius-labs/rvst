import { mount } from 'svelte';
import AsyncLoad from './AsyncLoad.svelte';

export function rvst_mount(target) {
  return mount(AsyncLoad, { target });
}

export default rvst_mount;
