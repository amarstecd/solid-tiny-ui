import path from "node:path";
import inline from "rollup-plugin-inline-import";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import solidPagesPlugin from "vite-plugin-solid-pages";

export default defineConfig({
  root: "./playground",
  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "../src")}/`,
      "~play/": `${path.resolve(__dirname, "./src")}/`,
    },
  },
  css: {
    modules: false,
  },
  server: {
    port: 5042,
  },
  define: {
    IS_DEV: "true",
  },
  plugins: [
    UnoCSS(),
    inline(),
    solidPlugin(),
    solidPagesPlugin({
      dir: "./playground/src/pages",
      extensions: ["tsx"],
    }),
  ],
});
