import { mount } from 'svelte';
import App from './App.svelte';
import './styles.css';

export function rvst_mount(target) {
  return mount(App, { target });
}
export default rvst_mount;
