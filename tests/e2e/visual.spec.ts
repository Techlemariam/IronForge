import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
    // Skipping visual check in CI due to OS-specific rendering differences (Windows Baseline vs Linux CI)
    test.skip('landing page visual check', async ({ page }) => {
        await page.goto('/welcome');
        await expect(page.locator('h1')).toBeVisible();
        await expect(page).toHaveScreenshot('landing-page.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05
        });
    });
});
