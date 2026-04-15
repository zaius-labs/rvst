import { mount } from 'svelte';
import Context from './Context.svelte';

export function rvst_mount(target) {
  return mount(Context, { target });
}

export default rvst_mount;
