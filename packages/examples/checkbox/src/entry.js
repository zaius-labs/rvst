import { mount } from 'svelte';
import Checkbox from './Checkbox.svelte';

export function rvst_mount(target) {
  return mount(Checkbox, { target });
}

export default rvst_mount;
