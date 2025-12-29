import { test, expect } from '@playwright/test';

test.describe('Core Gameplay', () => {

    test('should allow navigating to Iron Mines (Strength)', async ({ page }) => {
        await page.goto('/dashboard');

        // Navigate to Strength page
        await page.goto('/strength');

        // Verify page loads by checking unique element or title
        // Strength page has "StrengthContainer", let's look for a generic header or just ensure no 404
        await expect(page).not.toHaveTitle(/404/);
        // Maybe check for "Strength" text if available
        // await expect(page.getByText('Strength')).toBeVisible();
    });

    test('should allow viewing the Grimoire (Skills)', async ({ page }) => {
        await page.goto('/dashboard');
        // Navigate to Grimoire
        await page.goto('/grimoire');
        await expect(page.getByText('Grimoire')).toBeVisible();
        await expect(page.getByText('Skill Tree')).toBeVisible();
    });

    test('should visit the Marketplace', async ({ page }) => {
        await page.goto('/marketplace');
        await expect(page.getByText('Marketplace')).toBeVisible();
    });

    test('should log a workout set in Strength mode (Deep Interaction)', async ({ page }) => {
        // Go to Strength page
        await page.goto('/strength');

        // 1. Search for an exercise (e.g., "Squat")
        const searchInput = page.getByPlaceholder('Search exercises...');
        await expect(searchInput).toBeVisible({ timeout: 10000 });
        await searchInput.fill('Squat');

        // 2. Wait for results and click the first one
        const firstResult = page.locator('button').filter({ hasText: /Squat/i }).first();
        await expect(firstResult).toBeVisible({ timeout: 10000 });
        await firstResult.click();

        // 3. Verify StrengthLog component appeared (shows Add Set button)
        const addSetButton = page.getByRole('button', { name: /Add Set/i });
        await expect(addSetButton).toBeVisible({ timeout: 10000 });

        // 4. Add a set
        await addSetButton.click();

        // 5. Verify that a SetRow appeared (check for "kg" or "Reps" header)
        await expect(page.getByText('kg')).toBeVisible();
        await expect(page.getByText('Reps')).toBeVisible();

        // 6. (Optional) We could click "complete" on a set to test server action,
        //    but that might create DB pollution. For now, just verifying UI flow.
    });

});

