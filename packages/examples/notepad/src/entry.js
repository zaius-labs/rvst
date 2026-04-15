import { mount } from 'svelte';
import Notepad from './Notepad.svelte';

export function rvst_mount(target) {
  return mount(Notepad, { target });
}

export default rvst_mount;
