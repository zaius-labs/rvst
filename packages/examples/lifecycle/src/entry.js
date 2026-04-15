import { mount } from 'svelte';
import Lifecycle from './Lifecycle.svelte';
export function rvst_mount(target) { return mount(Lifecycle, { target }); }
export default rvst_mount;
