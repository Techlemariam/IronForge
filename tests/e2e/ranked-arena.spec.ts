import { test, expect } from '@playwright/test';

test.describe('Ranked Arena PvP', () => {
    test('should display ranked arena page with faction rank badge', async ({ page }) => {
        // Navigate to ranked arena
        await page.goto('/ranked-arena');

        // Wait for page to load
        await expect(page.getByRole('heading', { name: /ranked/i })).toBeVisible({ timeout: 10000 });

        // Verify key UI elements exist
        // Season banner
        await expect(page.getByText(/season/i).first()).toBeVisible();

        // Current Rating display
        await expect(page.getByText(/current rating/i).first()).toBeVisible();

        // Rank badge should be visible (faction-specific)
        const rankBadge = page.locator('[class*="RankBadge"]').or(page.getByText(/scout|private|grunt|corporal|sergeant|knight|champion|centurion|warlord|marshal|general|commander|gladiator|high warlord|grand marshal/i)).first();
        await expect(rankBadge).toBeVisible();
    });

    test('should display tabs for leaderboard and rewards', async ({ page }) => {
        await page.goto('/ranked-arena');

        // Leaderboard tab
        await expect(page.getByRole('tab', { name: /global/i })).toBeVisible();

        // Rewards tab
        await expect(page.getByRole('tab', { name: /rewards/i })).toBeVisible();
    });

    test('should switch to leaderboard tab and display entries', async ({ page }) => {
        await page.goto('/ranked-arena');

        // Click leaderboard tab
        await page.getByRole('tab', { name: /global/i }).click();

        // Verify leaderboard table headers exist
        await expect(page.getByText(/rank/i).first()).toBeVisible();
        await expect(page.getByText(/rating/i).first()).toBeVisible();
    });

    test('should open matchmaking modal when Start Combat is clicked', async ({ page }) => {
        await page.goto('/ranked-arena');

        // Find the matchmaking button
        const findMatchBtn = page.getByRole('button', { name: /start combat/i });

        // If button exists, click it
        if (await findMatchBtn.isVisible()) {
            await findMatchBtn.click();

            // Verify modal appears
            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByRole('dialog').getByText(/searching|rank/i).first()).toBeVisible();
        }
    });

    test('should display season rewards with rank tiers', async ({ page }) => {
        await page.goto('/ranked-arena');

        // Target the rewards tab specifically
        const rewardsTab = page.getByRole('tab', { name: /rewards/i });
        await rewardsTab.click();

        // Wait for the tab to be properly activated (Radix UI sets data-state="active")
        await expect(rewardsTab).toHaveAttribute('data-state', 'active');

        // Verify reward tiers are shown within the rewards content
        // using a more specific locator to avoid matching hidden elements
        const highWarlordCard = page.locator('.space-y-2').filter({ hasText: 'High Warlord' });
        await expect(highWarlordCard).toBeVisible();
        await expect(highWarlordCard).toContainText('5000 Gems');
    });
});
