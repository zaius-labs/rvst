import { mount } from 'svelte';
import Scroll from './Scroll.svelte';

export function rvst_mount(target) {
  return mount(Scroll, { target });
}

export default rvst_mount;
