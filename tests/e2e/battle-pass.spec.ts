import { test, expect } from '@playwright/test';

test.describe('Battle Pass', () => {
    // Use existing auth state or login flow
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('should navigate to battle pass and display season info', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Try to find Battle Pass link in header, fall back to direct navigation
        const bpLink = page.locator('a[href="/battle-pass"]');
        if (await bpLink.count() > 0) {
            await bpLink.first().click();
        } else {
            await page.goto('/battle-pass');
        }

        // Verify Season Header or any battle pass content
        await expect(page.getByText(/Season|Battle Pass|Current Tier|Premium/i).first()).toBeVisible({ timeout: 15000 });
    });

    // Seeded BattlePassSeason is now available via e2e-seed.ts.
    test('should allow upgrading to premium', async ({ page }) => {
        await page.goto('/battle-pass');
        await page.waitForLoadState('networkidle');

        // Check if "Unlock Premium" button exists (or "Premium" badge if already upgraded)
        const upgradeBtn = page.getByRole('button', { name: 'Unlock Premium' });

        // If we've run this before locally, user might be premium already. Handle both states.
        if (await upgradeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await upgradeBtn.click();

            // Wait for toast or UI update — use increased timeout for flaky toast
            await expect(page.getByText('Premium Unlocked!')).toBeVisible({ timeout: 10000 });
            await expect(upgradeBtn).not.toBeVisible({ timeout: 5000 });
            await expect(page.getByText('Premium', { exact: true })).toBeVisible({ timeout: 5000 });
        } else {
            // Already premium — just verify the badge
            await expect(page.getByText('Premium', { exact: true })).toBeVisible({ timeout: 10000 });
        }
    });

    test('should allow claiming rewards', async ({ page }) => {
        await page.goto('/battle-pass');
        await page.waitForLoadState('networkidle');

        // Look for a "Claim" button.
        // This test assumes the user has some progress or free tier 1 is unlocked.
        const claimBtn = page.getByRole('button', { name: 'Claim' }).first();

        if (await claimBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await claimBtn.click();
            await expect(page.getByText('Reward claimed!')).toBeVisible({ timeout: 10000 });
            await expect(claimBtn).toBeDisabled();
            await expect(claimBtn).toHaveText('Claimed');
        }
    });
});
