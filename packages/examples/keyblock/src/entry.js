import { mount } from 'svelte';
import KeyBlock from './KeyBlock.svelte';

export function rvst_mount(target) {
  return mount(KeyBlock, { target });
}

export default rvst_mount;
