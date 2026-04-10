import { defineConfig } from 'tsup';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react'],
  // Prepend "use client" directive AFTER bundling so Rollup's treeshake
  // (which strips module-level directives) can't remove it.
  async onSuccess() {
    const directive = '"use client";\n';
    const files = ['dist/index.js', 'dist/index.mjs'];
    for (const file of files) {
      const full = join(process.cwd(), file);
      const content = readFileSync(full, 'utf8');
      if (!content.startsWith('"use client"')) {
        writeFileSync(full, directive + content);
      }
    }
  },
});
