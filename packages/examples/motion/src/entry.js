import { mount } from 'svelte';
import Motion from './Motion.svelte';

export function rvst_mount(target) {
  return mount(Motion, { target });
}

export default rvst_mount;
