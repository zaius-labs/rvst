import { mount } from 'svelte';
import EffectPre from './EffectPre.svelte';

export function rvst_mount(target) {
  return mount(EffectPre, { target });
}

export default rvst_mount;
