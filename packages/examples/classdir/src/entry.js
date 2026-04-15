import { mount } from 'svelte';
import ClassDir from './ClassDir.svelte';

export function rvst_mount(target) {
  return mount(ClassDir, { target });
}

export default rvst_mount;
