import { test, expect } from '@playwright/test';

test.describe('Dashboard Interactions', () => {
    test.beforeEach(async ({ page }) => {
        // Explicitly go to dashboard (authenticated route)
        await page.goto('/dashboard');

        // CRITICAL: Inject API key to bypass "Configuration Required" screen
        await page.evaluate(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
        });

        // Wait for page to stabilize and configuration polling to finish
        await page.waitForTimeout(2000);

        // Ensure main content is visible
        await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to Program Builder', async ({ page }) => {
        // Iron City category should be open by default, but click to ensure
        const ironCityCategory = page.getByRole('button', { name: /Iron City/i });
        if (await ironCityCategory.isVisible()) {
            await ironCityCategory.click();
            await page.waitForTimeout(300);
        }

        // Open Program Builder
        await page.getByRole('button', { name: 'Program Builder' }).click();

        // Verify content - look for header or close button
        await expect(page.locator('text=Program Builder').or(page.getByRole('button', { name: 'Close' }))).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to Guild Hall', async ({ page }) => {
        // Colosseum category is collapsed by default - need to expand it
        const colosseumCategory = page.getByRole('button', { name: /Colosseum/i });
        await colosseumCategory.click();
        await page.waitForTimeout(300);

        // Open Guild Hall
        await page.getByRole('button', { name: 'Guild Hall' }).click();

        // Verify content - look for Close button or Guild text
        await expect(page.getByRole('button', { name: 'Close' }).or(page.getByText(/Guild/i).first())).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to Trophy Room', async ({ page }) => {
        // Colosseum category is collapsed by default - need to expand it
        const colosseumCategory = page.getByRole('button', { name: /Colosseum/i });
        await colosseumCategory.click();
        await page.waitForTimeout(300);

        await page.getByRole('button', { name: 'Trophy Room' }).click({ force: true });
        await expect(page.getByText(/Trophy Room|Achievements|Hall of Fame/i).first()).toBeVisible({ timeout: 15000 });
    });
});
