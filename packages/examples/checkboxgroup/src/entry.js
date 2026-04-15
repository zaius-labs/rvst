import { mount } from 'svelte';
import CheckboxGroup from './CheckboxGroup.svelte';

export function rvst_mount(target) {
  return mount(CheckboxGroup, { target });
}

export default rvst_mount;
