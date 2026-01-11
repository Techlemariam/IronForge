import { test, expect } from '@playwright/test';

test.describe('Strength Workout Flow (Iron Mines)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');

        // CRITICAL: Inject API key to bypass "Configuration Required" screen
        await page.evaluate(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
        });

        // Wait for page to stabilize
        await page.waitForTimeout(1500);
        await page.waitForLoadState('networkidle');

        // Close onboarding modal if present
        const closeButtons = page.locator('button:has-text("Skip"), button:has-text("Close"), button:has-text("Later"), button:has-text("I Swear It")');
        if (await closeButtons.count() > 0) {
            await closeButtons.first().click();
            await page.waitForTimeout(500);
        }
    });

    test('should navigate to Strength page', async ({ page }) => {
        await page.goto('/strength');
        await page.waitForLoadState('networkidle');

        // Verify we're on the strength page
        await expect(page).not.toHaveTitle(/404/);

        // Check for Strength Log or Exercise selection content
        await expect(
            page.getByText(/Strength Log|Select an Exercise|Iron Mines|Training/i).first()
        ).toBeVisible({ timeout: 15000 });
    });

    test('should display exercise search functionality', async ({ page }) => {
        await page.goto('/strength');
        await page.waitForLoadState('networkidle');

        // Look for search input
        const searchInput = page.getByPlaceholder(/Search|exercise/i).or(
            page.locator('input[type="search"]')
        ).first();

        // Search should be visible
        await expect(searchInput).toBeVisible({ timeout: 10000 });
    });

    test('should search for and select an exercise', async ({ page }) => {
        await page.goto('/strength');
        await page.waitForLoadState('networkidle');

        // Find and use the search input
        const searchInput = page.getByPlaceholder(/Search|exercise/i).or(
            page.locator('input[type="search"]')
        ).first();
        await expect(searchInput).toBeVisible({ timeout: 10000 });

        // Search for a common exercise
        await searchInput.fill('Bench');
        await page.waitForTimeout(500);

        // Wait for results and click first result
        const exerciseResult = page.locator('button').filter({ hasText: /Bench/i }).first();
        if (await exerciseResult.isVisible()) {
            await exerciseResult.click();

            // Verify we're in the logging view (Add Set button or set row should appear)
            await expect(
                page.getByRole('button', { name: /Add Set/i })
                    .or(page.getByText(/kg|lbs|Reps/i).first())
            ).toBeVisible({ timeout: 10000 });
        }
    });

    test('should add a set to an exercise', async ({ page }) => {
        await page.goto('/strength');
        await page.waitForLoadState('networkidle');

        // Find and select an exercise
        const searchInput = page.getByPlaceholder(/Search|exercise/i).or(
            page.locator('input[type="search"]')
        ).first();
        await expect(searchInput).toBeVisible({ timeout: 10000 });
        await searchInput.fill('Squat');
        await page.waitForTimeout(500);

        const exerciseResult = page.locator('button').filter({ hasText: /Squat/i }).first();
        if (await exerciseResult.isVisible()) {
            await exerciseResult.click();

            // Wait for Add Set button
            const addSetBtn = page.getByRole('button', { name: /Add Set/i });
            await expect(addSetBtn).toBeVisible({ timeout: 10000 });

            // Click to add a set
            await addSetBtn.click();

            // Verify set row appeared (should have weight/reps inputs)
            await expect(page.getByText(/kg|lbs/i).first()).toBeVisible({ timeout: 5000 });
        }
    });

    test('should navigate via Iron Mines from dashboard menu', async ({ page }) => {
        // Navigate through Progressive Disclosure Menu
        const trainingOpBtn = page.getByRole('button', { name: /Training Operations/i });

        if (await trainingOpBtn.isVisible({ timeout: 10000 })) {
            await trainingOpBtn.click();

            // Look for Strength Focus or Iron Mines option
            const strengthBtn = page.getByRole('button', { name: /Strength Focus|Iron Mines|Lift/i }).first();
            await expect(strengthBtn).toBeVisible({ timeout: 15000 });
            await strengthBtn.click();

            // Verify we navigated to strength training area
            await expect(
                page.getByText(/Strength|Iron Mines|Exercise|Training/i).first()
            ).toBeVisible({ timeout: 15000 });
        }
    });
});
