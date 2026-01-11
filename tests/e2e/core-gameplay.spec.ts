import { test, expect } from '@playwright/test';

test.describe('Core Gameplay', () => {

    test('should allow navigating to Iron Mines (Strength)', async ({ page }) => {
        await page.goto('/dashboard');

        // Navigate to Strength page
        await page.goto('/strength');

        // Verify page loads by checking unique element or title
        await expect(page).not.toHaveTitle(/404/);
        // Check for Strength Log header
        await expect(page.getByText(/Strength Log|Select an Exercise/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should allow viewing the Grimoire (Skills)', async ({ page }) => {
        await page.goto('/dashboard');
        // Navigate to Grimoire
        await page.goto('/grimoire');
        await expect(page.getByText(/Grimoire/i).first()).toBeVisible();
        await expect(page.getByText('Bestiary')).toBeVisible();
    });

    test('should visit the Marketplace', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for page to stabilize
        await page.waitForTimeout(1000);

        // Close onboarding modal if present
        const closeButton = page.locator('button:has-text("Skip"), button:has-text("Close"), button:has-text("Later")');
        if (await closeButton.count() > 0) {
            await closeButton.first().click();
            await page.waitForTimeout(500);
        }

        // Try to open Marketplace via button, fall back to direct navigation
        const marketplaceBtn = page.getByRole('button', { name: /Marketplace|Item Shop|Shop/i });
        if (await marketplaceBtn.count() > 0) {
            await marketplaceBtn.first().click({ force: true });
        } else {
            await page.goto('/marketplace');
        }

        await expect(page.getByText(/Marketplace|Item Shop|Gold|Equipment/i).first()).toBeVisible({ timeout: 15000 });
    });

    test.skip('should log a workout set in Strength mode (Deep Interaction)', async ({ page }) => {
        // Go to Strength page
        await page.goto('/strength');

        // 1. Search for an exercise using our seeded exercise
        const searchInput = page.getByPlaceholder('Search exercises...');
        await expect(searchInput).toBeVisible({ timeout: 10000 });
        await searchInput.fill('Bench');

        // 2. Wait for results and click the first one (we seeded "Bench Press")
        const firstResult = page.locator('button').filter({ hasText: /Bench/i }).first();
        await expect(firstResult).toBeVisible({ timeout: 15000 });
        await firstResult.click();

        // 3. Verify StrengthLog component appeared (shows Add Set button)
        const addSetButton = page.getByRole('button', { name: /Add Set/i });
        await expect(addSetButton).toBeVisible({ timeout: 10000 });

        // 4. Add a set
        await addSetButton.click();

        // 5. Verify that a SetRow appeared (check for "kg" or "Reps" header)
        await expect(page.getByText('kg')).toBeVisible();
        await expect(page.getByText('Reps')).toBeVisible();
    });

});
