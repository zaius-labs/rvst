import { mount } from 'svelte';
import Keyboard from './Keyboard.svelte';

export function rvst_mount(target) {
  return mount(Keyboard, { target });
}

export default rvst_mount;
