import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto('/login');

    // Debug: Listen for browser errors
    page.on('console', msg => {
        if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
        else console.log(`BROWSER LOG: ${msg.text()}`);
    });
    page.on('pageerror', err => {
        console.log(`BROWSER EXCEPTION: ${err.message}`);
    });

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

    // Pre-inject API key BEFORE login to avoid "Configuration Required" screen entirely
    await page.evaluate(() => {
        localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
    });

    // Click the login button and wait for navigation
    await Promise.all([
        page.waitForLoadState('networkidle', { timeout: 120000 }),
        page.getByRole('button', { name: /Initialize Uplink/i }).click()
    ]);

    // Give React time to hydrate after navigation
    await page.waitForTimeout(2000);

    // Now wait for either main-content OR config-screen
    try {
        await Promise.race([
            page.waitForSelector('#main-content', { timeout: 120000, state: 'visible' }),
            page.waitForSelector('#config-screen', { timeout: 120000, state: 'visible' })
        ]);
    } catch (e) {
        console.log("Initial wait timed out, checking state...");
    }

    // If config screen somehow still appears, reload
    if (await page.locator('#config-screen').isVisible()) {
        console.log("Config screen detected despite pre-injection. Reloading...");
        await page.reload({ waitUntil: 'networkidle' });
    }

    // Final wait for main content
    try {
        await page.waitForSelector('#main-content', {
            timeout: 120000,
            state: 'visible'
        });
    } catch (error) {
        // Debug: Log page content on failure FIRST
        try {
            const bodyText = await page.textContent('body');
            console.error('Auth setup failed. Page content:', bodyText?.substring(0, 500));
            console.error('Inner HTML:', await page.innerHTML('body'));
        } catch (e) {
            console.error('Failed to capture page content:', e);
        }

        try {
            await page.screenshot({ path: 'test-results/auth-failure.png' });
        } catch (e) {
            console.error('Failed to take screenshot:', e);
        }

        throw new Error(`Failed to find #main-content after reload. Page might be stuck.`);
    }

    // Verify we're not stuck on config screen
    if (await page.locator('#config-screen').isVisible()) {
        throw new Error('Still showing #config-screen after setting localStorage');
    }

    // Dismiss onboarding overlay if it appears (fallback for db-level fix)
    const onboardingButton = page.locator('button:has-text("Continue"), button:has-text("I Swear It")');
    let attempts = 0;
    while (await onboardingButton.count() > 0 && attempts < 5) {
        await onboardingButton.first().click();
        await page.waitForTimeout(500);
        attempts++;
    }

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
