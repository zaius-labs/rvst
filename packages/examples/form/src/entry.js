import { mount } from 'svelte';
import Form from './Form.svelte';

export function rvst_mount(target) {
  return mount(Form, { target });
}

export default rvst_mount;
