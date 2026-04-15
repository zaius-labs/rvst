import { mount } from 'svelte';
import EffectCleanup from './EffectCleanup.svelte';

export function rvst_mount(target) {
  return mount(EffectCleanup, { target });
}

export default rvst_mount;
