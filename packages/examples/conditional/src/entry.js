import { mount } from 'svelte';
import Conditional from './Conditional.svelte';

export function rvst_mount(target) {
  return mount(Conditional, { target });
}

export default rvst_mount;
