import { mount } from 'svelte';
import Todo from './Todo.svelte';

export function rvst_mount(target) {
  return mount(Todo, { target });
}

export default rvst_mount;
