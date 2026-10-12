import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end checks run against the already-running dev server on :8080.
 * Widths under test: 320, 375, 414 (phones) and 768 (tablet).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    ...devices["Desktop Chrome"],
    trace: "off",
    launchOptions: process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {},
  },
});
