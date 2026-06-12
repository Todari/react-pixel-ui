import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react'],
  // esbuild's banner is sourcemap-aware, so the prepended directive does
  // not shift the line mappings (a post-build prepend would). This config
  // does not enable tsup's rollup `treeshake` pass, which is the only
  // thing that would strip a module-level directive.
  banner: {
    js: '"use client";',
  },
});
