import { test, expect } from '@playwright/test';

test.describe('Critical Path', () => {
    test('should load the homepage', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/IronForge/);
    });

    test('should navigate to login page', async ({ page }) => {
        await page.goto('/');

        // If on Welcome Page (indicated by "Begin Your Saga"), click Log In
        const beginButton = page.getByRole('link', { name: /Begin Your Saga/i });
        if (await beginButton.isVisible()) {
            await page.getByRole('link', { name: /Log In/i }).first().click();
        }

        // Now check for Login Page elements
        await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    });
});
