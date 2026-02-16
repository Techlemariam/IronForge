import { test, expect } from '@playwright/test';

test.describe('Factory Orchestration Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the factory page
        await page.goto('/factory');
        // Wait for the page to be ready
        await expect(page.locator('h1')).toContainText(/Factory Dashboard/i);
    });

    test('should render all major orchestration sections', async ({ page }) => {
        // Wait for page hydration
        await expect(page.locator('h1')).toBeVisible();

        // Check for Backlog Board
        await expect(page.getByText(/Enterprise Backlog/i)).toBeVisible({ timeout: 15000 });

        // Check for Assembly Line
        await expect(page.getByText(/Assembly Line/i)).toBeVisible({ timeout: 15000 });

        // Check for Intelligence Quota (Gauges)
        await expect(page.getByText(/Intelligence Quota/i)).toBeVisible({ timeout: 15000 });

        // Check for Terminal - check by section title instead of icon class if possible
        await expect(page.getByText(/Live Log Stream/i)).toBeVisible({ timeout: 15000 });
    });

    test('should Promote item from Backlog to Assembly Line', async ({ page }) => {
        // 1. Find a "Kör" (Run) button in the backlog
        // Use a more specific locator for the button inside the backlog item
        const runButton = page.locator('button:has-text("Kör")').first();

        await runButton.waitFor({ state: 'visible', timeout: 15000 });
        const itemTitle = await page.locator('p.text-slate-200.line-clamp-1').first().textContent();

        // 2. Click Promote
        await runButton.click();

        // 3. Verify it shows up in "FABRICATION" stage (or similar)
        // Note: This matches the AssemblyLinePresenter logic where tasks appear
        await expect(page.locator('div.flex-1.space-y-4')).toContainText(itemTitle?.trim() || '', { timeout: 15000 });
    });

    test('should verify Quota Gauges rendering and numerical values', async ({ page }) => {
        // Verify we have at least one radial gauge
        const svgs = page.locator('svg');
        await expect(svgs.first()).toBeVisible({ timeout: 15000 });

        // Check for specific model labels
        await expect(page.getByText(/Gemini Flash/i)).toBeVisible({ timeout: 15000 });

        // Verify numerical values (Progress %, Hours, and Token Usage)
        // Progress should be a percentage
        await expect(page.getByText(/%/).first()).toBeVisible();

        // Hours left
        await expect(page.getByText(/h/).first()).toBeVisible();

        // Token usage count (e.g. "0 / 1,000,000")
        // We use a regex to look for digits/commas separated by a slash
        await expect(page.getByText(/[\d,]+\s*\/\s*[\d,]/).first()).toBeVisible();
    });

    test('should handle Emergency Stop toggle', async ({ page }) => {
        const freezeButton = page.getByRole('button', { name: /FREEZE ASSEMBLY/i });
        await freezeButton.waitFor({ state: 'visible', timeout: 15000 });

        await freezeButton.click();

        // Should show "RESUME" and change styling
        await expect(page.getByRole('button', { name: /RESUME ASSEMBLY/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(/EMERGENCY STOP ACTIVE/i)).toBeVisible();

        // Resume
        await page.getByRole('button', { name: /RESUME ASSEMBLY/i }).click();
        await expect(page.getByRole('button', { name: /FREEZE ASSEMBLY/i })).toBeVisible();
    });

    test('should verify Terminal log updates', async ({ page }) => {
        // Check for the "LIVE" pulse in the terminal
        await expect(page.locator('div.bg-emerald-500.animate-pulse')).toBeVisible({ timeout: 15000 });

        // Input a mock command
        const input = page.locator('input[placeholder*="command"]');
        if (await input.isVisible()) {
            await input.fill('/health-check');
            await page.keyboard.press('Enter');

            // Verify command appears in logs
            await expect(page.locator('div.font-mono')).toContainText('/health-check', { timeout: 15000 });
        }
    });
});
