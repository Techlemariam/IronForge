import { test, expect } from '@playwright/test';

// Reuse the authenticated state from auth.setup.ts
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Settings Lite Mode', () => {
    test.slow(); // Mark test as slow (3x timeout)
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings');
        // Wait for header to confirm page load
        await expect(page.locator('h1:has-text("Sanctum Settings")')).toBeVisible({ timeout: 10000 });
    });

    test('should toggle lite mode and hide RPG elements', async ({ page }) => {
        // Navigate to Interface tab
        await page.getByRole('tab', { name: 'Interface' }).click();

        // More robust selector strategy: 
        // Find the row containing "Lite Mode" text
        const preferenceRow = page.locator('div.flex.items-center.justify-between').filter({ hasText: 'Lite Mode' });

        // Find the toggle within that row
        const toggle = preferenceRow.locator('.rounded-full.cursor-pointer');

        await expect(toggle).toBeVisible();
        await toggle.click();

        // Wait for potential network latency (it communicates with server action)
        await page.waitForTimeout(3000);

        // Navigate back to Dashboard
        await page.goto('/dashboard');

        // Wait for dashboard to load
        await page.waitForLoadState('networkidle');

        // VERIFY: RPG Elements hidden
        // Use strict check for absence
        await expect(page.locator('#titan-avatar')).not.toBeVisible();
        await expect(page.locator('#quest-board')).not.toBeVisible();
        await expect(page.locator('#campaign-tracker')).not.toBeVisible();

        // CLEANUP: Reset state
        await page.goto('/settings');
        await expect(page.locator('h1:has-text("Sanctum Settings")')).toBeVisible({ timeout: 10000 });
        await page.getByRole('tab', { name: 'Interface' }).click();
        await toggle.click();
        await page.waitForTimeout(1000);
    });
});
