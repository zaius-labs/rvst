import { mount } from 'svelte';
import Awaitblock from './Awaitblock.svelte';

export function rvst_mount(target) {
  return mount(Awaitblock, { target });
}

export default rvst_mount;
