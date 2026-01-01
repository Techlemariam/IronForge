import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
    test('landing page visual check', async ({ page }) => {
        await page.goto('/');

        // Wait for critical elements to load
        await expect(page.locator('h1')).toBeVisible();

        // Take a snapshot and compare with baseline
        await expect(page).toHaveScreenshot('landing-page.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05 // Allow 5% noise for different rendering engines
        });
    });
});
