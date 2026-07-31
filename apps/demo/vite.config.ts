import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const reactPackage = JSON.parse(
  readFileSync(
    new URL("../../packages/react/package.json", import.meta.url),
    "utf8",
  ),
) as { version: string };

export default defineConfig({
  plugins: [react()],
  define: {
    __REACT_PIXEL_UI_VERSION__: JSON.stringify(reactPackage.version),
  },
  server: {
    port: 3000,
    open: false,
  },
});
