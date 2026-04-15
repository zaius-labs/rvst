import { mount } from 'svelte';
import Keyed from './Keyed.svelte';
export function rvst_mount(target) { return mount(Keyed, { target }); }
export default rvst_mount;
