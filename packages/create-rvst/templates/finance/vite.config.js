import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { rvstPlugin } from "@rvst/vite-plugin";

export default defineConfig({
  plugins: [rvstPlugin(), svelte()],
  build: {
    outDir: "dist",
    target: "esnext",
    lib: {
      entry: "src/entry.js",
      formats: ["es"],
      fileName: "finance",
    },
    rollupOptions: { external: [] },
  },
});
