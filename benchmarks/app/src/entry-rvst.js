// entry-rvst.js (RVST — renderer bridge)
import { mount } from 'svelte';
import App from './App.svelte';
export function rvst_mount(target) { return mount(App, { target }); }
export default rvst_mount;
