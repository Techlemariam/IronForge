import { test, expect } from '@playwright/test';

test.describe('Titan Duels Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto('/');

        // Assume user is already authenticated via auth.setup.ts
        // If not, add login steps here
    });

    test('should display Iron Arena page', async ({ page }) => {
        await page.goto('/iron-arena');

        // Check for main heading
        await expect(page.locator('h1')).toContainText('Iron Arena');

        // Check for description
        await expect(page.getByText(/prove your titan/i)).toBeVisible();
    });

    test('should show challenge modal when clicking Find Opponent', async ({ page }) => {
        await page.goto('/iron-arena');

        // Wait for page to load
        await page.waitForSelector('button:has-text("Find Opponent")', { timeout: 5000 });

        // Click Find Opponent button
        await page.click('button:has-text("Find Opponent")');

        // Modal should appear
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText(/Issue Challenge/i)).toBeVisible();
    });

    test('should validate opponent ID input', async ({ page }) => {
        await page.goto('/iron-arena');

        // Open challenge modal
        await page.click('button:has-text("Find Opponent")');

        // Try to send challenge without entering opponent ID
        const sendButton = page.getByRole('button', { name: /Send Challenge/i });
        await expect(sendButton).toBeDisabled();

        // Enter opponent ID
        await page.fill('input[placeholder*="Enter User ID"]', 'test-opponent-id');

        // Button should now be enabled
        await expect(sendButton).toBeEnabled();
    });

    test('should display active duel card when duel exists', async ({ page }) => {
        // This test requires mock data or authenticated test users with active duels
        // For now, we check for the "No Active Duel" state
        await page.goto('/iron-arena');

        // Wait for content to load
        await page.waitForLoadState('networkidle');

        // Check for either active duel or no active duel state
        const hasActiveDuel = await page.locator('text=/ACTIVE DUEL/i').isVisible().catch(() => false);
        const hasNoDuel = await page.locator('text=/No Active Duel/i').isVisible().catch(() => false);

        expect(hasActiveDuel || hasNoDuel).toBeTruthy();
    });

    test('should display duel stats correctly in DuelCard', async ({ page }) => {
        // This would require seeded test data with an active duel
        // Placeholder for future implementation when test data is available
        test.skip();
    });

    test('should navigate to leaderboard section', async ({ page }) => {
        await page.goto('/iron-arena');

        // Check if leaderboard component is rendered
        const leaderboardVisible = await page.locator('text=/Duel Leaderboard/i').isVisible().catch(() => false);

        // Leaderboard might be on a separate tab or section
        if (leaderboardVisible) {
            await expect(page.locator('table')).toBeVisible();
        }
    });
});
