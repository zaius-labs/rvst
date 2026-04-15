import { mount } from 'svelte';
import SnippetProps from './SnippetProps.svelte';

export function rvst_mount(target) {
  return mount(SnippetProps, { target });
}

export default rvst_mount;
