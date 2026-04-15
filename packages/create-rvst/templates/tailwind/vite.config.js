import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { rvstPlugin } from '@rvst/vite-plugin';

export default defineConfig({
  plugins: [tailwindcss(), rvstPlugin(), svelte()],
  build: {
    outDir: 'dist',
    target: 'esnext',
    lib: {
      entry: 'src/entry.js',
      formats: ['es'],
      fileName: 'app',
    },
    rollupOptions: { external: [] },
  },
});
