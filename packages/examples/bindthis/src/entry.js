import { mount } from 'svelte';
import Bindthis from './Bindthis.svelte';

export function rvst_mount(target) {
  return mount(Bindthis, { target });
}

export default rvst_mount;
