import { mount } from 'svelte';
import Snippets from './Snippets.svelte';

export function rvst_mount(target) {
  return mount(Snippets, { target });
}

export default rvst_mount;
