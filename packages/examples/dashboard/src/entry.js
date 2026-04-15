import { mount } from 'svelte';
import Dashboard from './Dashboard.svelte';

export function rvst_mount(target) {
  return mount(Dashboard, { target });
}

export default rvst_mount;
