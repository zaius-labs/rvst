import { mount } from "svelte";
import App from "./App.svelte";

// App.svelte wraps the SvelteKit page content
export function rvst_mount(target) {
  mount(App, { target });
}
