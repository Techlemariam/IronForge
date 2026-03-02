import { test, expect } from '@playwright/test';

test.describe('Public Critical Path', () => {
    // Disable storage state for this file to test public access
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should load the public homepage', async ({ page }) => {
        await page.goto('/welcome');

        // Should have IronForge branding or title
        await expect(page.getByText(/IronForge|Forge Your/i).first()).toBeVisible({ timeout: 10000 });

        // Should have a way to start or login
        await expect(page.getByRole('link', { name: /Begin Your Saga|Log In|Start/i }).first()).toBeVisible({ timeout: 10000 });
    });

    test('should verify login page is accessible', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    });
});
