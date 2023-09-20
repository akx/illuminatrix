import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

const isLibBuild = !!process.env.ILLUMINATRIX_LIB;
process.env.VITE_ILLUMINATRIX_LIB = isLibBuild ? "1" : "";
process.env.VITE_ILLUMINATRIX_VERSION = require("./package.json").version;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      emitCss: false, // no extra CSS
    }),
  ],
  base: "./",
  json: {
    namedExports: false,
    stringify: true,
  },
  build: {
    outDir: resolve(process.env.ILLUMINATRIX_OUT_DIR ?? "./dist"),
    lib: isLibBuild
      ? {
          entry: resolve(__dirname, "src/main.ts"),
          name: "Illuminatrix",
          fileName: "illuminatrix",
          formats: ["es"], // see https://github.com/vitejs/vite/issues/6555
        }
      : false,
  },
});
