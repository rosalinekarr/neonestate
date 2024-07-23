/// <reference types="vitest" />
import { readFileSync } from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
  plugins: [react()],
  server: {
    https: {
      key: readFileSync("./localhost.key"),
      cert: readFileSync("./localhost.crt"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/vitest-setup.ts"],
  },
});
