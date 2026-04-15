import { mount } from 'svelte';
import FormSubmit from './FormSubmit.svelte';

export function rvst_mount(target) {
  return mount(FormSubmit, { target });
}

export default rvst_mount;
