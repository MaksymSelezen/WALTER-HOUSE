import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "src"),

  publicDir: path.resolve(__dirname, "public"),

  base: "./",

  plugins: [
    handlebars({
      partialDirectory: path.resolve(__dirname, "src/partials"),
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/index.html"),
      },
    },
  },
});
