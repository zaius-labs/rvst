import { mount } from 'svelte';
import DocEditor from './DocEditor.svelte';

export function rvst_mount(target) {
  return mount(DocEditor, { target });
}

export default rvst_mount;
