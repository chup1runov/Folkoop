'use strict';

module.exports = {
  testDir: './web-preview',
  testMatch: 'e2e.spec.cjs',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node web-preview/server.cjs',
    url: 'http://127.0.0.1:3000/health',
    reuseExistingServer: false,
    timeout: 15_000
  }
};
