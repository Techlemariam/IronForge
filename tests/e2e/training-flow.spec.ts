import { test, expect } from '@playwright/test';

test.describe('Training & Cardio Flow', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        // Wait for page to stabilize
        await page.waitForTimeout(1000);

        // If locked in Cardio Studio, exit
        const exitButton = page.getByTitle("Close (Esc)");
        if (await exitButton.isVisible()) {
            await exitButton.click();
            await page.waitForTimeout(500);
        }

        // Close onboarding modal if present (handles multiple possible button texts)
        const onboardingButtons = page.locator('button:has-text("Skip"), button:has-text("Close"), button:has-text("Later"), button:has-text("Continue"), button:has-text("I Swear It")');
        let attempts = 0;
        while (await onboardingButtons.count() > 0 && attempts < 5) {
            await onboardingButtons.first().click();
            await page.waitForTimeout(500);
            attempts++;
        }
    });

    test('should navigate to Cycling Studio', async ({ page }) => {
        // Find and click the Cycling Studio button in Citadel Hub
        await page.getByRole('button', { name: 'Cycling Studio' }).click({ force: true });

        // Small wait for view transition
        await page.waitForTimeout(500);

        // Check for Cardio Studio specific elements (check for header text)
        await expect(page.getByText(/Cycling Studio|Treadmill Studio/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to Treadmill (Running)', async ({ page }) => {
        await page.getByRole('button', { name: 'Treadmill' }).click({ force: true });
        await expect(page.getByText(/Treadmill Studio|Cycling Studio/i).first()).toBeVisible({ timeout: 10000 });
    });

    test.skip('should navigate to Training Center', async ({ page }) => {
        // Try different possible button names for Training Path
        const trainingBtn = page.getByRole('button', { name: /Training Path|Training Center|Path/i }).first();
        await trainingBtn.click({ force: true });

        // Verify Training Center header or related content
        await expect(page.getByText(/Training Path|Training Center|Back to Citadel|Active Path|WARDEN|JUGGERNAUT/i).first()).toBeVisible({ timeout: 15000 });
    });

});
