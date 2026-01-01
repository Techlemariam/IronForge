import { test, expect } from '@playwright/test';

test.describe('Training & Cardio Flow', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
    });

    test('should navigate to Cycling Studio', async ({ page }) => {
        // Find and click the Cycling Studio button in Citadel Hub
        // It has text "Cycling Studio" and usually an icon.
        await page.getByRole('button', { name: 'Cycling Studio' }).click();

        // Check for Cardio Studio specific elements
        // Assuming Cardio Studio has a header "Cardio Mode" or similar, or specific controls
        // We'll wait for a known element.
        await expect(page.getByText('Cardio Mode')).toBeVisible({ timeout: 10000 });
        // Or check for "RPM" / "Speed" which likely appear in CardioStudio
        await expect(page.getByText(/RPM|Speed|Cadence/i).first()).toBeVisible();
    });

    test('should navigate to Treadmill (Running)', async ({ page }) => {
        await page.getByRole('button', { name: 'Treadmill' }).click();
        await expect(page.getByText('Cardio Mode')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to Training Center', async ({ page }) => {
        await page.getByRole('button', { name: 'Training Path' }).click();

        // Verify Training Center header
        await expect(page.getByText(/Active Training Path|Back to Citadel/i)).toBeVisible();
    });

});
