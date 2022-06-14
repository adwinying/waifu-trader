import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "/app"),
    },
  },

  test: {
    globals: true,
    setupFiles: "./tests/bootstrap.ts",
    restoreMocks: true,
  },
});
