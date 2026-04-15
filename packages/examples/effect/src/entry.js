import { mount } from 'svelte';
import Effect from './Effect.svelte';
export function rvst_mount(target) { return mount(Effect, { target }); }
export default rvst_mount;
