import { mount } from 'svelte';
import FileIO from './FileIO.svelte';

export function rvst_mount(target) {
  return mount(FileIO, { target });
}

export default rvst_mount;
