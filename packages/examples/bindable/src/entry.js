import { mount } from 'svelte';
import Bindable from './Bindable.svelte';

export function rvst_mount(target) {
  return mount(Bindable, { target });
}

export default rvst_mount;
