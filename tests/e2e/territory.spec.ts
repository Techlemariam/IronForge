import { test, expect } from '@playwright/test';

test.describe('Territory Page', () => {
    test('should load the territory map and stats', async ({ page }) => {
        // 1. Navigate to Territory Page
        // Assuming we have a test user logged in via auth setup or we mock it.
        // The playwright config suggests we use 'playwright/.auth/user.json'.
        // We should ensure we are authenticated. The config handles this for 'chromium' project.

        await page.goto('/territory');

        // 2. Verify Map Loads
        // The map container has an ID or class we can check.
        // TerritoryMap.tsx uses a ref but we can check for canvas or the container layout.
        // Looking at TerritoryMap.tsx, it renders a div. We should look for the canvas element MapLibre creates.
        const mapCanvas = page.locator('.maplibregl-canvas');
        await expect(mapCanvas).toBeVisible({ timeout: 10000 });

        // 3. Verify Stats Presence
        // We added a "Weekly Settlement" card.
        const settlementCard = page.getByText('Weekly Settlement');
        await expect(settlementCard).toBeVisible();

        // 4. Verify Home Zone Text (optional, if text is visible)
        // The Legend has "Titan's Sanctuary".
        const legendItem = page.getByText("Titan's Sanctuary");
        await expect(legendItem).toBeVisible();

        // 5. Check URL to confirm no redirects happened (e.g. back to login)
        expect(page.url()).toContain('/territory');
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/territory');

        // Check if map is still visible
        const mapCanvas = page.locator('.maplibregl-canvas');
        await expect(mapCanvas).toBeVisible();

        // Check if Stats grid adapts (Optional, maybe check if cards are stacked)
        // We won't go too deep into checking grid layout via CSS unless necessary.
    });
});
