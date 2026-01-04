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
        // More robust selector strategy: 
        // 1. Find the container for logic grouping
        const preferencesSection = page.locator('section:has-text("Preferences")');
        // 2. Find the toggle within that section
        // The toggle is a div with rounded-full and cursor-pointer classes
        const toggle = preferencesSection.locator('.rounded-full.cursor-pointer');

        await expect(toggle).toBeVisible();
        await toggle.click();

        // Wait for the network request to complete (updateUserPreferencesAction)
        await page.waitForTimeout(1000);

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
        await toggle.click();
        await page.waitForTimeout(1000);
    });
});
