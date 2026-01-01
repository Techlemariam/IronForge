import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto('/login');

    // Toggle to password mode if needed
    // Toggle to password mode if needed
    const passwordModeButton = page.getByRole('button', { name: /Login with Password/i });
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
    // Verify we are on the dashboard or root page
    await expect(page).toHaveURL(/.*\/$|.*dashboard/);
    // Optional: Check for a main navigation element to ensure page loaded
    await expect(page.getByRole('main')).toBeVisible({ timeout: 15000 });

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
