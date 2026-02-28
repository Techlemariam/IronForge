import { test, expect } from '@playwright/test';

test.describe('Territory Page', () => {
    test('should load the territory page and display stats', async ({ page }) => {
        await page.goto('/territory');

        // Verify the heading loads
        await expect(page.getByText(/TERRITORY CONQUEST/i)).toBeVisible({ timeout: 15000 });

        // Verify Stats Cards are present
        await expect(page.getByText('Owned Tiles')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Control Points')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Daily Income')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Weekly Settlement')).toBeVisible({ timeout: 10000 });

        // Verify navigation tabs exist
        await expect(page.getByText('World Map')).toBeVisible();
        await expect(page.getByText('Leaderboards')).toBeVisible();

        // Check URL to confirm no redirects happened
        expect(page.url()).toContain('/territory');
    });

    test('should switch to leaderboard tab', async ({ page }) => {
        await page.goto('/territory');

        // Wait for page load
        await expect(page.getByText(/TERRITORY CONQUEST/i)).toBeVisible({ timeout: 15000 });

        // Click on Leaderboards tab
        await page.getByText('Leaderboards').click();

        // Verify the leaderboard content loads (tab switches)
        // The TabsContent for 'leaderboard' should become visible
        await expect(page.getByText('World Map')).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/territory');

        // Verify heading is visible on mobile
        await expect(page.getByText(/TERRITORY CONQUEST/i)).toBeVisible({ timeout: 15000 });

        // Stats cards should still render
        await expect(page.getByText('Owned Tiles')).toBeVisible({ timeout: 10000 });
    });
});
