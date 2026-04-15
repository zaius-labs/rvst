import { mount } from 'svelte';
import TypeInput from './TypeInput.svelte';

export function rvst_mount(target) {
  return mount(TypeInput, { target });
}

export default rvst_mount;
