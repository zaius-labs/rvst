import { mount } from 'svelte';
import BugBench from './BugBench.svelte';

export function rvst_mount(target) {
  return mount(BugBench, { target });
}

export default rvst_mount;
