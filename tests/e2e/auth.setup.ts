import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto('/login');

    // Toggle to password mode
    const passwordModeButton = page.getByRole('button', { name: /Login with Password/i });
    await passwordModeButton.waitFor({ state: 'visible', timeout: 10000 });
    await passwordModeButton.click();

    // Wait for password input to appear (confirms toggle worked)
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });

    // Fill in credentials
    await page.getByPlaceholder('hunter@ironforge.com').fill(process.env.TEST_USER_EMAIL || 'alexander.teklemariam@gmail.com');
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'IronForge2025!');

    // Click the login button (should now be "Initialize Uplink" in password mode)
    await page.getByRole('button', { name: /Initialize Uplink/i }).click();

    // Wait for the dashboard to load (client-side redirect can be slow)
    // We wait for the main content container we added in DashboardClient.tsx
    await page.waitForSelector('#main-content', { timeout: 60000 });

    // Optional: Check if we are actually on a dashboard-like URL
    expect(page.url()).toMatch(/.*\/$|.*dashboard|.*iron-city/);

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
