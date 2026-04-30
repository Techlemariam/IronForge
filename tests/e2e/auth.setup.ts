import { readFile } from 'node:fs/promises';
import { test as setup } from '@playwright/test';
import { AuthPage } from './pages/auth.page';

const authFile = 'playwright/.auth/user.json';
const credentialsFile = 'playwright/.auth/credentials.json';

async function readSeededCredentials() {
  try {
    return JSON.parse(await readFile(credentialsFile, 'utf8')) as {
      email?: string;
      password?: string;
    };
  } catch {
    return {};
  }
}

setup('authenticate', async ({ page }) => {
  const seededCredentials = await readSeededCredentials();
  const testEmail = seededCredentials.email || process.env.TEST_USER_EMAIL;
  const testPassword = seededCredentials.password || process.env.TEST_USER_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error('E2E auth setup requires TEST_USER_EMAIL and TEST_USER_PASSWORD env vars.');
  }

  setup.setTimeout(180000);
  const authPage = new AuthPage(page);

  // Debug: Listen for browser errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
  });

  await authPage.goto();
  await authPage.login(testEmail, testPassword);

  const error = await authPage.checkError();
  if (error) {
    throw new Error(`Login failed: ${error}`);
  }

  await page.context().storageState({ path: authFile });
  console.log('Auth setup saved to context.');
});
