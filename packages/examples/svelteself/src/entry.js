import { mount } from 'svelte';
import SvelteSelf from './SvelteSelf.svelte';

export function rvst_mount(target) {
  return mount(SvelteSelf, { target });
}

export default rvst_mount;
