import { mount } from 'svelte';
import Stores from './Stores.svelte';

export function rvst_mount(target) {
  return mount(Stores, { target });
}

export default rvst_mount;
