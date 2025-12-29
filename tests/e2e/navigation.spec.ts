import { test, expect } from '@playwright/test';

test.describe('Navigation Smoke Tests', () => {

    test('should verify Dashboard elements', async ({ page }) => {
        await page.goto('/dashboard');

        // Verify key dashboard widgets
        await expect(page.getByText('Iron City')).toBeVisible();
        // Check for User Level or XP bar (assuming "Level" text exists)
        // await expect(page.getByText(/Level \d+/)).toBeVisible(); 
    });

    test('should navigate to Leaderboards', async ({ page }) => {
        await page.goto('/dashboard');
        // Open Social Hub (reusing logic from settings-social but streamlined)
        await page.getByRole('button', { name: 'Social Hub' }).click();
        await page.getByRole('button', { name: 'Leaderboards' }).click();
        await expect(page.getByText('Faction War')).toBeVisible();
    });

    test('should access Settings', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.getByText('System Configuration')).toBeVisible();
    });
});
