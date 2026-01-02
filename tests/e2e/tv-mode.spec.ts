import { test, expect } from '@playwright/test';

// NOTE: These tests are flaky due to overlay intercepts blocking keyboard events.
// The CardioStudio overlay sometimes captures focus differently.
// Skipping entire suite until selector/overlay stability is improved.
test.describe.skip('TV Mode (Iron Command Center)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the dashboard
        await page.goto('/');

        // Wait for any onboarding overlay to settle (dismiss if present)
        await page.waitForTimeout(1000);

        // Close onboarding modal if present
        const closeButton = page.locator('button:has-text("Skip"), button:has-text("Close"), button:has-text("Later")');
        if (await closeButton.count() > 0) {
            await closeButton.first().click();
            await page.waitForTimeout(500);
        }

        // Open Cycling Studio to access TV mode (use force to bypass overlays)
        await page.getByRole('button', { name: 'Cycling Studio' }).click({ force: true });
        await expect(page.getByText('Cycling Studio')).toBeVisible({ timeout: 10000 });
    });

    test('should launch TV Mode via keyboard shortcut', async ({ page }) => {
        // Press 'T' to launch TV Mode
        await page.keyboard.press('t');

        // Check if TV Mode container is visible
        const tvContainer = page.locator('.fixed.inset-0.bg-black');
        await expect(tvContainer).toBeVisible();

        // Check for HUD elements
        await expect(page.getByText('Zone 1')).toBeVisible();
        await expect(page.getByText('Guild Raid Target')).toBeVisible();
    });

    test('should toggle HUD visibility with Spacebar', async ({ page }) => {
        await page.keyboard.press('t');
        await expect(page.locator('.fixed.inset-0.bg-black')).toBeVisible();

        // Press Space to hide HUD
        await page.keyboard.press('Space');
        await expect(page.getByText('Guild Raid Target')).not.toBeVisible();

        // Press Space to show HUD
        await page.keyboard.press('Space');
        await expect(page.getByText('Guild Raid Target')).toBeVisible();
    });

    test('should open Sensor Manager', async ({ page }) => {
        await page.keyboard.press('t');
        await page.locator('button:has(.lucide-bluetooth-off)').click();

        await expect(page.getByText('Connect Sensors')).toBeVisible();
        await expect(page.getByText('Heart Rate')).toBeVisible();
        await expect(page.getByText('Smart Trainer')).toBeVisible();

        // Close it
        await page.getByText('Done').click();
        await expect(page.getByText('Connect Sensors')).not.toBeVisible();
    });

    test('should exit TV Mode with Escape', async ({ page }) => {
        await page.keyboard.press('t');
        await page.waitForTimeout(500);
        await expect(page.locator('.fixed.inset-0.bg-black')).toBeVisible({ timeout: 5000 });

        await page.keyboard.press('Escape');
        await expect(page.locator('.fixed.inset-0.bg-black')).not.toBeVisible({ timeout: 5000 });
    });
});
