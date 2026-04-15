import { mount } from 'svelte';
import M2Smoke from './M2Smoke.svelte';

export function rvst_mount(target) {
  return mount(M2Smoke, { target });
}

export default rvst_mount;
