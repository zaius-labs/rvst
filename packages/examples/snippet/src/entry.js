import { mount } from 'svelte';
import Snippet from './Snippet.svelte';
export function rvst_mount(target) { return mount(Snippet, { target }); }
export default rvst_mount;
