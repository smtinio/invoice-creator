import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The logic modules are pure, so they run in plain Node — no browser
    // environment needed, which keeps the test run fast.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
