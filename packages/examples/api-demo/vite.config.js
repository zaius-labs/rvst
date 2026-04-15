import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { rvstPlugin } from '@rvst/vite-plugin';
import { rvstApiPlugin } from '@rvst/codegen';

export default defineConfig({
  plugins: [rvstApiPlugin(), rvstPlugin(), svelte()],
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    lib: { entry: 'src/entry.js', formats: ['es'], fileName: 'app' },
  },
});
