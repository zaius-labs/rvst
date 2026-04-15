import { mount } from 'svelte';
import App from '../../shared/src/App.svelte';
import '../../shared/src/styles.css';

mount(App, { target: document.getElementById('app') });
