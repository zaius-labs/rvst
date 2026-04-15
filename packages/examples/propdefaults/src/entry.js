import { mount } from 'svelte';
import PropDefaults from './PropDefaults.svelte';

export function rvst_mount(target) {
  return mount(PropDefaults, { target });
}

export default rvst_mount;
