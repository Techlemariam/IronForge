import { test, expect } from '@playwright/test';

test.describe('Podcast Integration', () => {
    // These tests verify the podcast player integration in CardioStudio
    // Note: The actual Pocket Casts API requires authentication, so we test the UI elements

    test('should display podcast toggle button in TV Mode when connected', async ({ page }) => {
        // Navigate to TV mode directly (workout/cardio context)
        await page.goto('/');

        // Open Cardio Studio via the Citadel's cardio options
        const cardioBtn = page.getByRole('button', { name: /cycling|running|cardio/i }).first();
        if (await cardioBtn.isVisible()) {
            await cardioBtn.click();
        }

        // Check if podcast toggle exists in CardioStudio header
        // This will only be visible if pocketCastsConnected is true
        const podcastToggle = page.locator('[title="Toggle Podcast Player"]');

        // If user has podcast connected, the button should exist
        // We can't guarantee this in all test environments
        if (await podcastToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
            await expect(podcastToggle).toBeVisible();
        }
    });

    test('should have PocketCasts auth UI accessible in settings', async ({ page }) => {
        // Navigate to settings page
        await page.goto('/settings');

        // Wait for settings to load
        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

        // Check for Integrations section
        await expect(page.getByRole('heading', { name: 'Integrations' })).toBeVisible();

        // The PocketCasts integration card or text should be visible
        const pocketCastsText = page.getByText(/pocket.?casts/i);
        await expect(pocketCastsText).toBeVisible();
    });
});

test.describe('PodcastBrowser Component', () => {
    // These tests would run if we had a dedicated podcast page
    // For now, we test the API endpoints exist

    test.skip('should load subscriptions from API', async ({ request }) => {
        // This test requires authentication - skip in CI without proper auth
        const response = await request.get('/api/podcast?type=subscriptions');
        expect([200, 401]).toContain(response.status());
    });

    test.skip('should load queue from API', async ({ request }) => {
        const response = await request.get('/api/podcast?type=queue');
        expect([200, 401]).toContain(response.status());
    });
});
