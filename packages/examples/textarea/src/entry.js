import { mount } from 'svelte';
import Textarea from './Textarea.svelte';

export function rvst_mount(target) {
  return mount(Textarea, { target });
}

export default rvst_mount;
