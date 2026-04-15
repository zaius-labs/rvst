import { mount } from 'svelte';
import Actions from './Actions.svelte';

export function rvst_mount(target) {
  return mount(Actions, { target });
}

export default rvst_mount;
