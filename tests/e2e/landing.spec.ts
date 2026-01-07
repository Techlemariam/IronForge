
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load the landing page at root', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/IronForge RPG | Train Like a Titan/i);

        // Check Hero visibility
        await expect(page.getByText('Forge Your Legacy')).toBeVisible();
        await expect(page.getByText('System Operational')).toBeVisible();
    });

    test('should navigate to login from CTA', async ({ page }) => {
        await page.goto('/');

        // Click "Begin Your Saga" which is the new main CTA
        await page.getByRole('link', { name: /Begin Your Saga/i }).first().click();

        // Expect to be on login page
        await expect(page).toHaveURL(/\/login/);
    });

    test('should display feature grid', async ({ page }) => {
        await page.goto('/');

        // Scroll to features
        const featuresHeading = page.getByText('The Oracle AI');
        await featuresHeading.scrollIntoViewIfNeeded();
        await expect(featuresHeading).toBeVisible();

        // Check for a specific feature card
        await expect(page.getByText('PvP & Boss Battles')).toBeVisible();
    });

    test('should display social proof', async ({ page }) => {
        await page.goto('/');

        // Scroll to stats
        const statsHeading = page.getByText('The Legion is Growing');
        await statsHeading.scrollIntoViewIfNeeded();
        await expect(statsHeading).toBeVisible();

        // Check stats
        await expect(page.getByText('Active Titans')).toBeVisible();
    });
});
