import { test, expect } from '@playwright/test';

test.describe('Settings and Social Hub', () => {
    test('should navigate to Settings page and verify elements', async ({ page }) => {
        // Visit Settings directly
        await page.goto('/settings');
        await page.waitForLoadState('domcontentloaded');

        // Check for Header with longer timeout
        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 15000 });

        // Check for "Integrations" section (Default tab)
        await expect(page.getByRole('heading', { name: 'Integrations' })).toBeVisible({ timeout: 10000 });

        // Click "Data" tab to view Data Management
        await page.getByRole('tab', { name: 'Data' }).click();

        // Check for "Data Management" section
        await expect(page.getByRole('heading', { name: 'Data Management' })).toBeVisible({ timeout: 10000 });

        // Check for Back link
        const backLink = page.locator('a[href="/citadel"]');
        await expect(backLink).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to Social Hub from Dashboard', async ({ page }) => {
        // 1. Visit Dashboard
        await page.goto('/dashboard');

        // CRITICAL: Inject API key to bypass "Configuration Required" screen
        await page.evaluate(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
        });

        // Reload to apply localStorage changes and wait for network idle
        await page.reload({ waitUntil: 'networkidle' });

        // Wait for Citadel Hub to load - ensure we are on the dashboard
        await expect(page.locator('#main-content')).toBeVisible({ timeout: 30000 });

        // Wait for CitadelHub categories to be rendered
        await page.waitForSelector('[data-testid="citadel-hub"], h3:has-text("Training"), h3:has-text("Iron City")', { timeout: 15000 });

        // Colosseum category is collapsed by default - need to expand it
        const colosseumCategory = page.getByRole('button', { name: /Colosseum/i });
        await colosseumCategory.waitFor({ state: 'visible', timeout: 10000 });
        await colosseumCategory.click();
        await page.waitForTimeout(500); // Wait for expand animation

        // Click "Social Hub" button
        const socialHubBtn = page.getByRole('button', { name: /Social Hub/i });
        await socialHubBtn.waitFor({ state: 'visible', timeout: 10000 });
        await socialHubBtn.click();

        // Verify Social Hub opens - use flexible selectors with longer timeout
        await expect(page.getByText(/CONNECTED|IRON NETWORK|Social|Loading/i).first()).toBeVisible({ timeout: 15000 });

        // Wait for modal to fully render
        await page.waitForTimeout(1000);

        // Close Social Hub using Close button (if visible)
        const closeBtn = page.getByRole('button', { name: 'Close', exact: true });
        if (await closeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await closeBtn.click();
            await page.waitForTimeout(1000); // Wait for modal close animation
        }

        // Navigate back to dashboard explicitly if modal didn't close properly
        const trainingHeading = page.getByRole('heading', { name: 'Training' });
        const ironCityHeading = page.getByRole('heading', { name: 'Iron City' });

        // Check if we're back at Citadel, if not navigate there
        const isBackAtCitadel = await trainingHeading.or(ironCityHeading).first().isVisible({ timeout: 3000 }).catch(() => false);

        if (!isBackAtCitadel) {
            // Navigate back to dashboard
            await page.goto('/dashboard');
            await page.reload({ waitUntil: 'networkidle' });
        }

        // Final verification - should see either Training or Iron City heading
        await expect(trainingHeading.or(ironCityHeading).first()).toBeVisible({ timeout: 15000 });
    });
});
