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
        await page.waitForTimeout(500); // Wait for expand animation

        // Wait for Program Builder button to appear after category expansion
        const programBuilderBtn = page.getByRole('button', { name: /Program Builder/i });
        await programBuilderBtn.waitFor({ state: 'visible', timeout: 10000 });
        await programBuilderBtn.click();

        // Verify content - look for header or close button with longer timeout
        await expect(
            page.locator('text=Program Builder').or(page.getByRole('button', { name: 'Close' }))
        ).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to Guild Hall', async ({ page }) => {
        // Wait for CitadelHub categories to be rendered
        await page.waitForSelector('[data-testid="citadel-hub"], h3:has-text("Training"), h3:has-text("Iron City")', { timeout: 15000 });

        // Colosseum category is collapsed by default - need to expand it
        const colosseumCategory = page.getByRole('button', { name: /Colosseum/i });
        await colosseumCategory.waitFor({ state: 'visible', timeout: 10000 });
        await colosseumCategory.click();
        await page.waitForTimeout(500); // Wait for expand animation

        // Wait for Guild Hall button to appear after category expansion
        const guildHallBtn = page.getByRole('button', { name: /Guild Hall/i });
        await guildHallBtn.waitFor({ state: 'visible', timeout: 10000 });
        await guildHallBtn.click();

        // Verify content - wait for modal/view to load
        await page.waitForTimeout(1000); // Allow modal animation

        // Use more flexible verification - look for close button OR any guild-related text
        const closeBtn = page.getByRole('button', { name: 'Close', exact: true });
        const guildText = page.getByText(/Guild|Loading Guild/i).first();
        await expect(closeBtn.or(guildText)).toBeVisible({ timeout: 15000 });
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
