import { mount } from 'svelte';
import MediaQueryEx from './MediaQueryEx.svelte';

export function rvst_mount(target) {
  return mount(MediaQueryEx, { target });
}

export default rvst_mount;
