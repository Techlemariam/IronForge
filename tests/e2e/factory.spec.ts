import { test, expect } from '@playwright/test';

test.describe('Factory Orchestration Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the factory page
        await page.goto('/factory');
        // Wait for the page to be ready (increased timeout for CI)
        await expect(page.getByRole('heading', { name: /Factory Dashboard/i })).toBeVisible({ timeout: 20000 });
    });

    test('should render all major orchestration sections', async ({ page }) => {
        // Wait for page hydration
        await expect(page.locator('h1')).toBeVisible();

        // Check for Enterprise Backlog (BacklogBoardPresenter)
        await expect(page.getByText(/Enterprise Backlog/i)).toBeVisible({ timeout: 15000 });

        // Check for Feature Assembly Line (page.tsx section heading)
        await expect(page.locator('h2', { hasText: 'Feature Assembly Line' }).first()).toBeVisible({ timeout: 15000 });

        // Check for Intelligence Quota Dashboard (CommandCenterPresenter)
        await expect(page.getByText(/Intelligence Quota Dashboard/i)).toBeVisible({ timeout: 15000 });

        // Check for Station Health Status (page.tsx section heading)
        await expect(page.getByText(/Station Health Status/i)).toBeVisible({ timeout: 15000 });
    });

    test('should Promote item from Backlog to Assembly Line', async ({ page }) => {
        // 1. Find a "Kör" (Run) button in the backlog
        const runButton = page.locator('button:has-text("Kör")').first();

        await runButton.waitFor({ state: 'visible', timeout: 15000 });
        const itemTitle = await page.locator('p.text-slate-200.line-clamp-1').first().textContent();

        // 2. Click Promote
        await runButton.click();

        // 3. Wait for processing to complete (button shows loader, then item disappears)
        await expect(runButton).not.toBeAttached({ timeout: 15000 });
    });

    test('should verify Quota Gauges rendering and numerical values', async ({ page }) => {
        // Wait for the Quota Dashboard section to load
        await expect(page.getByText(/Intelligence Quota Dashboard/i)).toBeVisible({ timeout: 15000 });

        // Verify we have at least one radial gauge SVG
        const svgs = page.locator('svg');
        await expect(svgs.first()).toBeVisible({ timeout: 15000 });

        // Verify numerical values — progress percentage
        await expect(page.getByText(/%/).first()).toBeVisible();

        // Hours left indicator
        await expect(page.getByText(/h/).first()).toBeVisible();

        // Token usage count (e.g. "0 / 1,000,000")
        await expect(page.getByText(/[\d,]+\s*\/\s*[\d,]/).first()).toBeVisible();
    });

    test('should handle Emergency Stop toggle', async ({ page }) => {
        // The Emergency Stop is a button with aria-label "Emergency Stop"
        const stopButton = page.getByRole('button', { name: /Emergency Stop/i });
        await stopButton.waitFor({ state: 'visible', timeout: 15000 });

        // Verify initial state shows "ACTIVE"
        await expect(page.getByText('ACTIVE', { exact: true })).toBeVisible();

        // Click the emergency stop
        await stopButton.click();

        // Should show "STOPPED" and "Line Frozen"
        await expect(page.getByText('STOPPED', { exact: true })).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/Line Frozen/i)).toBeVisible();

        // Resume — button now has aria-label "Resume Factory Line"
        const resumeButton = page.getByRole('button', { name: /Resume Factory Line/i });
        await resumeButton.click();

        // Should return to "ACTIVE"
        await expect(page.getByText('ACTIVE', { exact: true })).toBeVisible({ timeout: 5000 });
    });
});
