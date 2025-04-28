// @ts-check
const { defineConfig, devices } = require("@playwright/test");
import dotenv from "dotenv";
import path from "path";

// Read from ".env" file.
dotenv.config({ path: path.resolve(__dirname, ".env") });

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 120_000,
  use: {
    baseURL: `https://${process.env.PUBLIC_DOMAIN}`,
    httpCredentials: {
      username: process.env.BASIC_AUTH_USERNAME,
      password: process.env.BASIC_AUTH_PASSWORD,
    },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.js/ },
    {
      name: "main",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tmp/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
