import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const banner =
  "// Nextbike Austria Card — bundled by Rollup. Edit sources in src/, then `npm run build`.";

export default {
  input: "src/index.js",
  output: {
    file: "custom_components/nextbike_austria/www/nextbike-austria-card.js",
    format: "es",
    sourcemap: false,
    banner,
    // HACS users get a single .js file, not a chunked dist/. The editor's
    // dynamic import (getConfigElement) gets inlined into the main bundle.
    inlineDynamicImports: true,
  },
  plugins: [
    nodeResolve(),
    terser({ format: { comments: /Nextbike Austria Card/ } }),
  ],
};
