import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    setup.setTimeout(180000); // 3 minutes total test budget
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
    await passwordModeButton.waitFor({ state: 'visible', timeout: 30000 });
    await passwordModeButton.click();

    // Wait for password input to appear (confirms toggle worked)
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 30000 });

    // Fill in credentials
    console.log("Filling credentials...");
    const emailInput = page.getByPlaceholder('hunter@ironforge.com');
    await emailInput.waitFor({ state: 'visible', timeout: 30000 });
    await emailInput.fill(process.env.TEST_USER_EMAIL || 'alexander.teklemariam@gmail.com');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 30000 });
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'IronForge2025!');

    // Pre-inject API key BEFORE login to avoid "Configuration Required" screen entirely
    console.log("Pre-injecting Hevy API key...");
    await page.evaluate(() => {
        localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
    });

    // Click the login button and wait for navigation
    console.log("Clicking Initialize Uplink and waiting for URL...");
    await Promise.all([
        page.waitForURL(url => url.pathname === '/' || url.pathname === '/welcome', { timeout: 60000 }).catch(e => console.log("Navigation check:", e.message)),
        page.getByRole('button', { name: /Initialize Uplink/i }).click()
    ]);

    console.log("Current URL after login attempt:", page.url());

    // Check for login error messages
    const errorMsg = page.locator('div:has-text("Authentication protocol failed"), div:has-text("Invalid login credentials")');
    if (await errorMsg.count() > 0 && await errorMsg.first().isVisible()) {
        const text = await errorMsg.first().textContent();
        console.error(`LOGIN ERROR DETECTED: ${text}`);
    }

    // Capture state immediately after attempt
    try {
        await page.screenshot({ path: 'test-results/post-login-state.png' });
    } catch (e) {
        console.log("Failed to take post-login screenshot:", e.message);
    }

    // Now wait for either main-content OR config-screen
    console.log("Waiting for dashboard selectors...");
    try {
        await Promise.race([
            page.waitForSelector('#main-content', { timeout: 60000, state: 'visible' }),
            page.waitForSelector('#config-screen', { timeout: 60000, state: 'visible' })
        ]);
        console.log("Dashboard or configuration screen detected.");
    } catch (e) {
        console.log("Dashboard selectors timed out. Capturing body transcript...");
        const content = await page.textContent('body').catch(() => 'TRANSCRIPT FAILED');
        console.log("Full page body snippet:", content?.substring(0, 1000));

        // Final attempt - check for onboarding overlay
        if (await page.locator('button:has-text("Continue")').isVisible()) {
            console.log("Onboarding overlay found, continuing...");
        } else {
            throw new Error(`Auth setup failed to land on dashboard. URL: ${page.url()}. Body: ${content?.substring(0, 200)}`);
        }
    }

    // Dismiss onboarding overlay if it appears
    const onboardingButton = page.locator('button:has-text("Continue"), button:has-text("I Swear It")');
    let attempts = 0;
    while (await onboardingButton.count() > 0 && attempts < 5) {
        console.log(`Dismissing onboarding (attempt ${attempts + 1})...`);
        await onboardingButton.first().click();
        await page.waitForTimeout(1000);
        attempts++;
    }

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
    console.log("Auth setup saved to context.");
});
