import { mount } from 'svelte';
import AtHtml from './AtHtml.svelte';

export function rvst_mount(target) {
  return mount(AtHtml, { target });
}

export default rvst_mount;
