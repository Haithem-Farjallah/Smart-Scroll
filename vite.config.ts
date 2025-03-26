import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    rollupOptions: {
      input: {
        popup: "./popup.html",
        content: "./src/popup/content.tsx",
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name].[ext]",
        chunkFileNames: "chunks/[name].[hash].js",
      },
    },
  },
});
