import { mount } from 'svelte';
import Select from './Select.svelte';

export function rvst_mount(target) {
  return mount(Select, { target });
}

export default rvst_mount;
