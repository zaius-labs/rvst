import { mount } from 'svelte';
import SpreadProps from './SpreadProps.svelte';

export function rvst_mount(target) {
  return mount(SpreadProps, { target });
}

export default rvst_mount;
