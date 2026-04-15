// entry.js (Electron/Tauri — browser DOM)
import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app') || document.body });
