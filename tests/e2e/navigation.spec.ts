import { test, expect } from '@playwright/test';

test.describe('Navigation Smoke Tests', () => {

    test('should verify Dashboard elements', async ({ page }) => {
        await page.goto('/');

        // Wait for page to stabilize
        await page.waitForTimeout(1000);

        // Close onboarding modal if present
        const closeButton = page.locator('button:has-text("Skip"), button:has-text("Close"), button:has-text("Later")');
        if (await closeButton.count() > 0) {
            await closeButton.first().click();
            await page.waitForTimeout(500);
        }

        // Verify key dashboard widgets - check for Citadel Hub or any main element
        await expect(page.getByText(/Iron City|Citadel|Training|Oracle/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to Leaderboards', async ({ page }) => {
        // Directly navigate to Colosseum which has leaderboards
        await page.goto('/colosseum');

        // Check for Iron Colosseum or Leaderboard content
        await expect(page.getByText(/Iron Colosseum|Gladiators|RANK|Leaderboard/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should access Settings', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.getByText('Integrations')).toBeVisible({ timeout: 15000 });
    });
});
