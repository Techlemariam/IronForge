import { test, expect } from '@playwright/test';

test.describe('Cardio PvP Duels Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/iron-arena');

        // Open Find Opponent
        await page.getByRole('button', { name: 'Find Opponent' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText(/Issue Challenge/i)).toBeVisible();

        // Select Opponent (First available with Level)
        // Use a more generic selector that waits for hydration
        const opponentButton = page.locator('button').filter({ hasText: /Lvl/i }).first();
        await expect(opponentButton).toBeVisible({ timeout: 15000 });
        await opponentButton.click();

        // Challenge Action
        await page.getByRole('button', { name: 'Challenge Titan' }).click();

        // Verify Wizard is open before tests start
        await expect(page.getByText('Create Cardio Duel')).toBeVisible();
    });

    test('should display default wizard state correctly', async ({ page }) => {
        // Defaults: Cycling selected
        await expect(page.getByText('Cycling')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cycling', pressed: true })).toBeVisible();
        await expect(page.getByText('Running')).toBeVisible();
        await expect(page.getByText('Distance Race')).toBeVisible();
    });

    test('should allow configuring a Speed Demon cycling duel', async ({ page }) => {
        // Select Speed Demon
        await page.click('button:has-text("Speed Demon")'); // Text selector is reliable for these big cards

        // Verify Distance Options appear
        await expect(page.getByText('Target Distance (km)')).toBeVisible();

        // Use exact check for button visibility
        const dist20 = page.getByRole('button', { name: '20km' });
        await expect(dist20).toBeVisible();
        await dist20.click();

        // Check W/kg slider existence (since Cycling is default)
        await expect(page.getByText('Fairness Tier (W/kg)')).toBeVisible();

        // Check Submit Button
        await expect(page.getByRole('button', { name: 'Challenge Titan' })).toBeEnabled();
    });

    test('should switch to Running mode options', async ({ page }) => {
        // Switch to Running
        await page.getByRole('button', { name: 'Running' }).click();

        // Verify Running is selected
        await expect(page.getByRole('button', { name: 'Running', pressed: true })).toBeVisible();

        // Verify W/kg slider is GONE (Running doesn't have it currently in MVP)
        await expect(page.getByText('Fairness Tier (W/kg)')).not.toBeVisible();

        // Verify Speed Demon distances for running
        await page.click('button:has-text("Speed Demon")');

        // Running typically has shorter distances in config, check for 5km
        await expect(page.getByRole('button', { name: '5km' })).toBeVisible();
    });
});
