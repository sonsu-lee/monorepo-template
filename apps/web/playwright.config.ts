import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3000';
const isCI = Boolean(process.env.CI);

export default defineConfig({
  failOnFlakyTests: isCI,
  forbidOnly: isCI,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['html', { open: 'never' }]],
  retries: isCI ? 2 : 0,
  testDir: './e2e',
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm start --hostname 127.0.0.1 --port 3000',
    reuseExistingServer: !isCI,
    timeout: 120_000,
    url: baseURL,
  },
  workers: isCI ? 1 : undefined,
});
