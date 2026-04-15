import { mount } from 'svelte';
import ScrollEvent from './ScrollEvent.svelte';

export function rvst_mount(target) {
  return mount(ScrollEvent, { target });
}

export default rvst_mount;
