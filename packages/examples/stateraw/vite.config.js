import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { rvstPlugin } from '../../js/vite-plugin-rvst/src/index.js';

export default defineConfig({
  plugins: [rvstPlugin(), svelte()],
  build: {
    outDir: 'dist',
    target: 'esnext',
    lib: {
      entry: 'src/entry.js',
      formats: ['es'],
      fileName: 'stateraw',
    },
  },
});
