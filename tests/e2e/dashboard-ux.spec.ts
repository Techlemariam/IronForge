import { test, expect } from '@playwright/test';

// Reuse the authenticated state from auth.setup.ts
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Settings Lite Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings');
        // Wait for header to confirm page load
        await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
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

        // Wait for Toast confirmation
        await expect(page.locator('text=Lite Mode Enabled')).toBeVisible();

        // Navigate back to Dashboard
        await page.goto('/dashboard');

        // Ensure main dashboard loaded (wait for spinner to disappear if needed)
        // We use a safe anchor that is present in both modes
        await expect(page.locator('#view-container')).toBeVisible();

        // VERIFY: RPG Elements hidden
        // Use strict check for absence
        await expect(page.locator('#titan-avatar')).not.toBeVisible();
        await expect(page.locator('#quest-board')).not.toBeVisible();
        await expect(page.locator('#campaign-tracker')).not.toBeVisible();

        // VERIFY: Core Data Elements visible
        // Ultrathink is always visible
        await expect(page.locator('#ultrathink-dashboard')).toBeVisible();

        // CLEANUP: Reset state
        await page.goto('/settings');
        await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
        await toggle.click();
        await expect(page.locator('text=RPG Mode Enabled')).toBeVisible();
    });
});
