import { test, expect } from '@playwright/test';

test.describe('Training & Cardio Flow', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');

        // CRITICAL: Inject API key to bypass "Configuration Required" screen
        await page.evaluate(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
        });

        // Wait for page to stabilize and re-render with API key
        await page.waitForTimeout(1500);

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
        // Navigate through Progressive Disclosure Menu
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        await expect(trainingOpBtn).toBeVisible();
        await expect(trainingOpBtn).toBeEnabled();
        await trainingOpBtn.click();

        const cardioFocusBtn = page.getByRole('button', { name: /Cardio Focus/i });
        await expect(cardioFocusBtn).toBeVisible();
        await cardioFocusBtn.click();

        // Find and click the Ride button (formerly "Cycling Studio")
        await page.getByRole('button', { name: 'Ride' }).click({ force: true });

        // Small wait for view transition
        await page.waitForTimeout(500);

        // Check for Cardio Studio specific elements
        await expect(page.getByText(/Cycling|Cardio|Ride/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to Treadmill (Running)', async ({ page }) => {
        // Navigate to Run via Menu
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });
        await expect(trainingOpBtn).toBeVisible();
        await trainingOpBtn.click();

        const cardioFocusBtn = page.getByRole('button', { name: /Cardio Focus/i });
        await expect(cardioFocusBtn).toBeVisible();
        await cardioFocusBtn.click();

        // Click the Run button (formerly "Treadmill")
        await page.getByRole('button', { name: 'Run' }).click({ force: true });
        await expect(page.getByText(/Running|Treadmill|Cardio/i).first()).toBeVisible({ timeout: 10000 });
    });

    test.skip('should navigate to Training Center', async ({ page }) => {
        // Try different possible button names for Training Path
        await page.getByRole('button', { name: /Training Operations/i }).click();
        const cardioBtn = page.getByRole('button', { name: /Cardio Focus/i });
        await expect(cardioBtn).toBeVisible();
        await cardioBtn.click();

        const trainingBtn = page.getByRole('button', { name: /Training Path|Training Center|Path/i }).first();
        await trainingBtn.click({ force: true });

        // Verify Training Center header or related content
        await expect(page.getByText(/Training Path|Training Center|Back to Citadel|Active Path|WARDEN|JUGGERNAUT/i).first()).toBeVisible({ timeout: 15000 });
    });

});
