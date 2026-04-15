import { mount } from 'svelte';
import PageNav from './PageNav.svelte';

export function rvst_mount(target) {
  return mount(PageNav, { target });
}

export default rvst_mount;
