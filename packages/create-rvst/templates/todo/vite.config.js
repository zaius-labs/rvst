import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { rvstPlugin } from "@rvst/vite-plugin";
export default defineConfig({
  plugins: [rvstPlugin(), svelte()],
  resolve: {
    alias: {
      "$lib": "/src/lib",
      "$components": "/src/lib/components",
      "$types": "/src/types",
    },
  },
  build: {
    outDir: "dist",
    target: "esnext",
    lib: {
      entry: "src/entry.js",
      formats: ["es"],
      fileName: "todo",
    },
    rollupOptions: { external: [] },
    cssCodeSplit: false,
  },
});
