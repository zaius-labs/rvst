import { mount } from 'svelte';
import BindChecked from './BindChecked.svelte';

export function rvst_mount(target) {
  return mount(BindChecked, { target });
}

export default rvst_mount;
