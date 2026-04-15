import { mount } from 'svelte';
import Routing from './Routing.svelte';

export function rvst_mount(target) {
  return mount(Routing, { target });
}

export default rvst_mount;
