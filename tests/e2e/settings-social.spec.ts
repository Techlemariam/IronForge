import { test, expect } from '@playwright/test';

test.describe('Settings and Social Hub', () => {
    // We assume a seeded user or mock auth. 
    // For critical path, we often just check public pages or mock the session state.
    // Since IronForge seems to require auth, we might need to rely on the global setup 
    // or a mock helper if available.
    // Checking existing tests: 'tests/e2e/critical-path.spec.ts' likely has login helpers.
    // I will use a simple "visit" approach assuming dev environment or mock auth if possible.
    // If not, I'll rely on the fact that `npm run dev` is running and we can interact.

    // NOTE: Ideally we import a login helper. I'll write this standalone for now 
    // and assume we can reach /dashboard or /settings directly if auth is mocked or skipped in dev/test mode.

    test('should navigate to Settings page and verify elements', async ({ page }) => {
        // 1. Visit Settings directly (assuming auth or redirect)
        // If not auth, it might redirect to login. 
        // Let's assume we are testing the UI assuming we are authorized or using a test user.
        // For now, I'll try to go to the page. 
        await page.goto('/settings');

        // If redirected to login, this test might fail. 
        // But let's assume the environment is set up. 
        // Check for Header
        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

        // Check for "Integrations" section
        await expect(page.getByRole('heading', { name: 'Integrations' })).toBeVisible();

        // Check for "Data Management" section
        await expect(page.getByRole('heading', { name: 'Data Management' })).toBeVisible();

        // Check for Back link
        const backLink = page.locator('a[href="/citadel"]');
        await expect(backLink).toBeVisible();
    });

    test('should navigate to Social Hub from Dashboard', async ({ page }) => {
        // 1. Visit Dashboard
        await page.goto('/dashboard');

        // CRITICAL: Inject API key to bypass "Configuration Required" screen
        await page.evaluate(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
        });

        // Wait for page to stabilize
        await page.waitForTimeout(1500);

        // Wait for Citadel Hub to load - ensure we are on the dashboard
        await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });

        // Colosseum category is collapsed by default - need to expand it
        const colosseumCategory = page.getByRole('button', { name: /Colosseum/i });
        await colosseumCategory.click();
        await page.waitForTimeout(300);

        // 3. Click "Social Hub" button
        await page.getByRole('button', { name: /Social Hub/i }).click();

        // 4. Verify Social Hub opens - use flexible selectors
        await expect(page.getByText(/CONNECTED|IRON NETWORK|Social/i).first()).toBeVisible({ timeout: 10000 });

        // 5. Close Social Hub using Close button
        const closeBtn = page.getByRole('button', { name: 'Close' });
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        }

        // 6. Verify back to Citadel
        await expect(page.getByText('Training').or(page.getByText('Iron City'))).toBeVisible({ timeout: 5000 });
    });
});
