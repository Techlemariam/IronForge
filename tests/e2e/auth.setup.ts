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
    await page.waitForSelector('#main-content', { timeout: 90000 });

    // Optional: Check if we are actually on a dashboard-like URL
    expect(page.url()).toMatch(/.*\/$|.*dashboard|.*iron-city/);

    // Bypass "Configuration Required" screen if it appears
    await page.evaluate(() => {
        localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
    });

    // Reload to ensure the DashboardClient picks up the local storage key
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for main content with retry logic and better error handling
    try {
        await page.waitForSelector('#main-content', {
            timeout: 90000,
            state: 'visible'
        });
    } catch (error) {
        // Debug: Take screenshot and log page content on failure
        await page.screenshot({ path: 'test-results/auth-failure.png' });
        const bodyText = await page.textContent('body');
        console.error('Auth setup failed. Page content:', bodyText?.substring(0, 500));
        throw new Error(`Failed to find #main-content after reload. Page might be stuck or crashed.`);
    }

    // Verify we're not stuck on config screen
    const configText = await page.textContent('body');
    if (configText?.includes('Configuration Required')) {
        throw new Error('Still showing Configuration Required screen after setting localStorage');
    }

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
