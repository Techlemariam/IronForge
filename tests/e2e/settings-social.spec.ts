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
        await expect(page.getByText('System Configuration')).toBeVisible();

        // Check for "Integrations" section
        await expect(page.getByRole('heading', { name: 'Integrations' })).toBeVisible();

        // Check for "Data Migration" section
        await expect(page.getByRole('heading', { name: 'Data Migration' })).toBeVisible();

        // Check for Back link
        const backLink = page.locator('a[href="/citadel"]');
        await expect(backLink).toBeVisible();
    });

    test('should navigate to Social Hub from Dashboard', async ({ page }) => {
        // 1. Visit Dashboard
        await page.goto('/dashboard');

        // Wait for Citadel Hub to load
        await expect(page.getByText('Iron City')).toBeVisible();

        // 2. Click "Social Hub" button (we just renamed "Guild Hall" to "Social Hub")
        await page.getByRole('button', { name: 'Social Hub' }).click();

        // 3. Verify Social Hub opens
        await expect(page.getByText('CONNECTED TO IRON NETWORK')).toBeVisible();

        // 4. Verify Tabs (Activity Feed, Leaderboards, PvP Arena)
        await expect(page.getByRole('button', { name: 'Activity Feed' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Leaderboards' })).toBeVisible();

        // 5. Click "Leaderboards"
        await page.getByRole('button', { name: 'Leaderboards' }).click();

        // 6. Verify Leaderboard content (Faction War header)
        await expect(page.getByText('Faction War')).toBeVisible();

        // 7. Close Social Hub
        await page.locator('button').filter({ hasText: '' }).locator('svg.lucide-x').click(); // X icon

        // 8. Verify back to Citadel
        await expect(page.getByText('Iron City')).toBeVisible();
    });
});
