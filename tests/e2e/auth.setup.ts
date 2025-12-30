import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto('/login');

    // Toggle to password mode if needed
    const passwordModeButton = page.getByRole('button', { name: /Use Access Key Protocol/i });
    if (await passwordModeButton.isVisible()) {
        await passwordModeButton.click();
        // Wait for animation
        await page.waitForTimeout(500);
    }

    // Fill in credentials
    await page.getByPlaceholder('hunter@ironforge.com').fill('alexander.teklemariam@gmail.com');

    // Use locator by type for robustness against placeholder rendering
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.fill('IronForge2025!');

    // Click Login
    await page.getByRole('button', { name: 'Initialize Uplink' }).click();

    // specific check to see if we are logged in.
    // The dashboard usually has "Iron City" or "Citadel" text.
    // Adjust timeout if cold boot is slow.
    await expect(page.getByText('Iron City')).toBeVisible({ timeout: 15000 });

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
