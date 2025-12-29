import { resolve } from "path";
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";

export default defineConfig({
  base: "./",
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, "src/partials"),
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        slide2: resolve(__dirname, "slide-2.html"),
        slide3: resolve(__dirname, "slide-3.html"),
        slide4: resolve(__dirname, "slide-4.html"),
        slide5: resolve(__dirname, "slide-5.html"),
        slide6: resolve(__dirname, "slide-6.html"),
      },
    },
  },
});
