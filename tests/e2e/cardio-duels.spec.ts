import { test, expect } from '@playwright/test';

test.describe('Cardio PvP Duels Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/iron-arena');
    });

    test('should open Cardio Duel wizard after selecting opponent', async ({ page }) => {
        // 1. Open Find Opponent
        await page.click('button:has-text("Find Opponent")');
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText(/Issue Challenge/i)).toBeVisible();

        // 2. Select Opponent (Select first available in list)
        // Wait for opponents to load. Note: use case-insensitive matching
        const opponentButton = page.locator('button').filter({ hasText: /Lvl/i }).first();
        await expect(opponentButton).toBeVisible({ timeout: 15000 });
        await opponentButton.click();

        // Click Challenge button
        await page.click('button:has-text("Challenge Titan")');

        // 3. Verify Cardio Duel Modal Opens
        // Look for "Create Cardio Duel" title
        await expect(page.getByText('Create Cardio Duel')).toBeVisible();

        // 4. Verify Options
        await expect(page.getByText('Cycling')).toBeVisible();
        await expect(page.getByText('Running')).toBeVisible();
        await expect(page.getByText('Distance Race')).toBeVisible();
    });

    test.skip('should allow configuring a Speed Demon cycling duel', async ({ page }) => {
        // Navigate through wizard
        await page.click('button:has-text("Find Opponent")');
        const opponentButton = page.locator('button').filter({ hasText: /Lvl/i }).first();
        await expect(opponentButton).toBeVisible({ timeout: 15000 });
        await opponentButton.click();
        await page.click('button:has-text("Challenge Titan")');

        // Select Speed Demon
        await page.click('button:has-text("Speed Demon")');

        // Verify Distance Options appear
        await expect(page.getByText('Target Distance (km)')).toBeVisible();
        await expect(page.getByText('5km')).toBeVisible();
        await expect(page.getByText('40km')).toBeVisible();

        // Select 20km
        await page.click('button:has-text("20km")');

        // Check W/kg slider existence (since Cycling is default)
        await expect(page.getByText('Fairness Tier (W/kg)')).toBeVisible();
    });

    test.skip('should switch to Running mode options', async ({ page }) => {
        // Navigate through wizard
        await page.click('button:has-text("Find Opponent")');
        const opponentButton = page.locator('button').filter({ hasText: /Lvl/i }).first();
        await expect(opponentButton).toBeVisible({ timeout: 15000 });
        await opponentButton.click();
        await page.click('button:has-text("Challenge Titan")');

        // Switch to Running
        await page.click('button:has-text("Running")');

        // Verify W/kg slider is GONE (Running doesn't have it)
        await expect(page.getByText('Fairness Tier (W/kg)')).not.toBeVisible();

        // Verify Speed Demon distances for running (should be different, e.g. 5km, 10km)
        await page.click('button:has-text("Speed Demon")');
        await expect(page.getByText('1km')).toBeVisible(); // Running specific
    });
});
