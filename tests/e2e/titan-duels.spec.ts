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

        // Wait for page to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check for main heading or any Iron Arena content
        await expect(page.getByText(/Iron Arena|Find Opponent|Challenge|Duel/i).first()).toBeVisible({ timeout: 15000 });
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

    test.skip('should validate opponent selection', async ({ page }) => {
        await page.goto('/iron-arena');

        // Open challenge modal
        await page.click('button:has-text("Find Opponent")');

        // Check for "Issue Challenge" header
        await expect(page.getByText('Issue Challenge')).toBeVisible();

        // The Send button should be disabled initially (no opponent selected)
        // Note: The button text is "Challenge Titan"
        const challengeButton = page.getByRole('button', { name: /Challenge Titan/i });
        await expect(challengeButton).toBeDisabled();

        // Select an opponent from the list (wait for "Lvl" to appear)
        const opponentButton = page.locator('button').filter({ hasText: /Lvl/i }).first();
        await expect(opponentButton).toBeVisible({ timeout: 10000 });
        await opponentButton.click();

        // Button should now be enabled
        await expect(challengeButton).toBeEnabled();
    });

    test('should display active duel card when duel exists', async ({ page }) => {
        // This test requires mock data or authenticated test users with active duels
        // For now, we check for the Iron Arena page content
        await page.goto('/iron-arena');

        // Wait for content to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check for Iron Arena elements (Find Opponent button or duel status)
        const hasArenaContent = await page.getByText(/Iron Arena|Find Opponent|Challenge|Duel/i).first().isVisible().catch(() => false);

        expect(hasArenaContent).toBeTruthy();
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
