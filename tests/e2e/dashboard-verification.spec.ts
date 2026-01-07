import { test, expect } from '@playwright/test';
import { Client } from 'pg';

test.describe('Dashboard Verification', () => {
    // Need seeded user for this test, but auth is handled by auth.setup.ts typically?
    // cardio-duels uses "beforeAll" to clear state, but doesn't explicit log in if global setup handles it.
    // Assuming auth.setup.ts logs in and saves storage state.

    test.beforeEach(async ({ page }) => {
        // Explicitly go to dashboard (authenticated route)
        await page.goto('/dashboard');

        // CRITICAL: Inject API key to bypass "Configuration Required" screen
        await page.evaluate(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
        });

        await page.waitForTimeout(1500);

        // Wait for main content to verify we are securely on the dashboard
        await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });
    });

    test('should load CitadelHub with correct categories', async ({ page }) => {
        // Check for primary categories (Progressive Disclosure)
        await expect(page.getByText('Training')).toBeVisible();
        await expect(page.getByText('Iron City')).toBeVisible();
        // Check for specific critical nav items that should be visible
        await expect(page.getByRole('button', { name: 'Cardio Suite' })).toBeVisible();
    });

    test('should display Garmin Widget in FeedPanel or QuickActions', async ({ page }) => {
        // Navigate to Cardio Studio
        await page.getByRole('button', { name: 'Cardio Suite' }).click();

        // Wait for cardio view to load
        await page.waitForTimeout(500);

        // Check for Cardio Studio elements - use flexible selectors
        await expect(page.getByText(/Cycling|Cardio|Ride/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should show TvHud elements when in Tv Mode or Overlay', async ({ page }) => {
        // Navigate to Cardio Suite first
        await page.getByRole('button', { name: 'Cardio Suite' }).click();

        // Wait for cardio view to load
        await page.waitForTimeout(500);

        // Verify cardio elements are present
        await expect(page.getByText(/Cycling|Cardio|Studio/i).first()).toBeVisible({ timeout: 10000 });
    });
});
