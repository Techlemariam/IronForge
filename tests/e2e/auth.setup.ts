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

    // Wait for email input to appear (confirms toggle worked)
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
        page.waitForURL(url => url.pathname === '/' || url.pathname === '/welcome', { timeout: 60000 }).catch((e: any) => console.log("Navigation check:", e.message)),
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
    } catch (e: any) {
        console.log("Failed to take post-login screenshot:", e.message);
    }

    // Now wait for either main-content OR config-screen
    console.log("Waiting for dashboard selectors...");
    try {
        await Promise.race([
            page.waitForSelector('#main-content', { timeout: 90000, state: 'visible' }),
            page.waitForSelector('#config-screen', { timeout: 90000, state: 'visible' }),
            page.waitForURL(url => url.pathname === '/' || url.pathname === '/welcome', { timeout: 90000 })
        ]);
        console.log("Dashboard or configuration screen detected.");
    } catch (e: any) {
        console.log(`Landing page wait timed out or failed. Current URL: ${page.url()}`);

        // Final attempt - check for REAL onboarding overlay (only if NOT on login page)
        const isNotOnLogin = !page.url().includes('/login');
        const onboardingVisible = await page.locator('h2:has-text("Awaken, Titan"), button:has-text("I Swear It")').isVisible();

        if (isNotOnLogin && onboardingVisible) {
            console.log("Real onboarding overlay found, continuing...");
        } else {
            const content = await page.content().catch(() => "Could not capture content");
            const message = `Auth setup failed to land on dashboard. URL: ${page.url()}. Body snippet: ${content?.substring(0, 500)}. Error: ${e.message}`;
            console.error(message);
            throw new Error(message);
        }
    }

    // Handle onboarding if still visible
    let attempts = 0;
    while (attempts < 5) {
        const onboardingLocator = page.locator('h2:has-text("Awaken, Titan"), button:has-text("I Swear It")').first();
        if (!(await onboardingLocator.isVisible())) break;

        console.log(`Dismissing onboarding (attempt ${attempts + 1})...`);
        const nextButton = page.locator('button:has-text("Continue"), button:has-text("I Swear It")').first();
        if (await nextButton.isVisible()) {
            await nextButton.click();
            // Wait for animation/DB update
            await page.waitForTimeout(2000);
        }
        attempts++;
    }

    // Explicitly wait for the overlay to be GONE regarding of how we got here
    const overlay = page.locator('.fixed.inset-0.z-\\[100\\]');
    if (await overlay.isVisible()) {
        console.log("Waiting for overlay to disappear...");
        await overlay.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => console.log("Overlay did not disappear in time!"));
    }

    // CRITICAL: Re-inject API key AFTER all navigations to ensure it persists
    // This handles cases where the key might get cleared during redirects
    console.log("Re-injecting Hevy API key after navigation...");
    await page.evaluate(() => {
        localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
    });

    // Small wait to ensure localStorage is set before saving state
    await page.waitForTimeout(500);

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
    console.log("Auth setup saved to context.");
});
