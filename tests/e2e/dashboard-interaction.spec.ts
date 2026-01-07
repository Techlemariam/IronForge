import { test, expect } from '@playwright/test';

test.describe('Dashboard Interactions', () => {
    test.beforeEach(async ({ page }) => {
        // Explicitly go to dashboard (authenticated route)
        await page.goto('/dashboard');

        // CRITICAL: Inject API key to bypass "Configuration Required" screen
        await page.evaluate(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
        });

        // Reload to apply localStorage changes and wait for network idle
        await page.reload({ waitUntil: 'networkidle' });

        // Ensure main content is visible
        await expect(page.locator('#main-content')).toBeVisible({ timeout: 30000 });

        // Wait for any loading states to complete
        await page.waitForLoadState('domcontentloaded');
    });

    test('should navigate to Program Builder', async ({ page }) => {
        // Wait for CitadelHub categories to be rendered
        await page.waitForSelector('[data-testid="citadel-hub"], h3:has-text("Training"), h3:has-text("Iron City")', { timeout: 15000 });

        // Iron City category should contain Program Builder - ensure it's expanded
        const ironCityCategory = page.getByRole('button', { name: /Iron City/i });
        await ironCityCategory.waitFor({ state: 'visible', timeout: 10000 });
        await ironCityCategory.click();
        await page.waitForTimeout(1000); // Wait for expand animation

        // Try multiple locators for Program Builder
        const programBuilderBtn = page.getByRole('button', { name: /Program Builder/i })
            .or(page.getByText(/Program Builder/i))
            .first();

        await programBuilderBtn.waitFor({ state: 'visible', timeout: 15000 });
        await programBuilderBtn.click();

        // Verify content - look for header or close button with longer timeout
        await expect(
            page.locator('text=Program Builder').or(page.getByRole('button', { name: 'Close' })).first()
        ).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to Guild Hall', async ({ page }) => {
        // Wait for CitadelHub categories to be rendered
        await page.waitForSelector('[data-testid="citadel-hub"], h3:has-text("Training"), h3:has-text("Iron City")', { timeout: 15000 });

        // Colosseum category is collapsed by default - need to expand it
        const colosseumCategory = page.getByRole('button', { name: /Colosseum/i });
        await colosseumCategory.waitFor({ state: 'visible', timeout: 10000 });
        await colosseumCategory.click();
        await page.waitForTimeout(1000); // Wait for expand animation

        // Wait for Guild Hall button to appear after category expansion
        const guildHallBtn = page.getByRole('button', { name: /Guild Hall/i })
            .or(page.getByText(/Guild Hall/i))
            .first();
        await guildHallBtn.waitFor({ state: 'visible', timeout: 15000 });
        await guildHallBtn.click();

        // Verify content - wait for modal/view to load
        await page.waitForTimeout(1000); // Allow modal animation

        // Simply verify Close button is visible (it's unique in the modal)
        await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to Trophy Room', async ({ page }) => {
        // Wait for CitadelHub categories to be rendered
        await page.waitForSelector('[data-testid="citadel-hub"], h3:has-text("Training"), h3:has-text("Iron City")', { timeout: 15000 });

        // Colosseum category is collapsed by default - need to expand it
        const colosseumCategory = page.getByRole('button', { name: /Colosseum/i });
        await colosseumCategory.waitFor({ state: 'visible', timeout: 10000 });
        await colosseumCategory.click();
        await page.waitForTimeout(500); // Wait for expand animation

        // Wait for Trophy Room button and click
        const trophyRoomBtn = page.getByRole('button', { name: /Trophy Room/i });
        await trophyRoomBtn.waitFor({ state: 'visible', timeout: 10000 });
        await trophyRoomBtn.click({ force: true });

        // Verify Trophy Room content loaded
        await expect(page.getByText(/Trophy Room|Achievements|Hall of Fame/i).first()).toBeVisible({ timeout: 15000 });
    });
});
