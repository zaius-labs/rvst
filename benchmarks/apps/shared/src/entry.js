import { mount } from 'svelte';
import App from './App.svelte';
import './styles.css';

// For browser-based targets (Electron, Tauri)
const target = document.getElementById('app') || document.body;
mount(App, { target });
