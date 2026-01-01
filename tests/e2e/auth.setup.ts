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
    await page.getByPlaceholder('hunter@ironforge.com').fill('alexander.teklemariam@gmail.com');
    await passwordInput.fill('IronForge2025!');

    // Click the login button (should now be "Initialize Uplink" in password mode)
    await page.getByRole('button', { name: /Initialize Uplink/i }).click();

    // specific check to see if we are logged in.
    // The dashboard usually has "Iron City" or "Citadel" text.
    // Wait for navigation after login (client-side redirect can be slow)
    await page.waitForURL(/.*\/$|.*dashboard|.*iron-city/, { timeout: 30000 });
    // Optional: Check for a main navigation element to ensure page loaded
    await expect(page.getByRole('main')).toBeVisible({ timeout: 15000 });

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
