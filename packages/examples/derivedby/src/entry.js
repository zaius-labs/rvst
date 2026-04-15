import { mount } from 'svelte';
import DerivedBy from './DerivedBy.svelte';

export function rvst_mount(target) {
  return mount(DerivedBy, { target });
}

export default rvst_mount;
