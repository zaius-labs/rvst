import { mount } from 'svelte';
import App from '../../shared/src/App.svelte';
import '../../shared/src/styles.css';

export function rvst_mount(target) {
  return mount(App, { target });
}
export default rvst_mount;
