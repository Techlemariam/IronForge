
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load the landing page at root', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/IronForge RPG | Train Like a Titan/i);

        // Check Hero visibility
        await expect(page.getByText('Phase 3: The Living Titan is Here')).toBeVisible();
        await expect(page.getByRole('heading', { name: /IRONFORGE/i })).toBeVisible();
    });

    test('should navigate to login from CTA', async ({ page }) => {
        await page.goto('/');

        // Click "Join the Faction"
        await page.getByRole('link', { name: /JOIN THE FACTION/i }).click();

        // Expect to be on login page
        await expect(page).toHaveURL(/\/login/);
    });

    test('should display feature grid', async ({ page }) => {
        await page.goto('/');

        // Scroll to features
        const featuresHeading = page.getByText('A New Era of Performance');
        await featuresHeading.scrollIntoViewIfNeeded();
        await expect(featuresHeading).toBeVisible();

        // Check for a specific feature card
        await expect(page.getByText('The Oracle AI')).toBeVisible();
    });

    test('should display pricing properties', async ({ page }) => {
        await page.goto('/');

        // Scroll to pricing
        const pricingHeading = page.getByText('Choose Your Path');
        await pricingHeading.scrollIntoViewIfNeeded();
        await expect(pricingHeading).toBeVisible();

        // Check pricing options
        await expect(page.getByText('Recruit')).toBeVisible();
        await expect(page.getByText('Titan')).toBeVisible();
    });
});
