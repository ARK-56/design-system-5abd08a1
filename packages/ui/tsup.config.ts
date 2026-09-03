import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  // Every component here is built on Radix, which needs hooks and context, so the
  // whole package is a client boundary. Without this, importing it from a Next.js
  // App Router server component fails at build time.
  banner: { js: '"use client";' },
  external: ["react", "react-dom"],
  outExtension({ format }) {
    return { js: format === "esm" ? ".esm.js" : ".cjs.js" };
  }
});
