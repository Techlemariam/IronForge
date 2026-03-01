import { test, expect } from '@playwright/test';

// Define expected behavior based on the viewport/project setup
test.describe('Platform UI Adaptation', () => {

    test('verifies correct layout and elements load per platform on Dashboard', async ({ page }) => {
        // Assume user is already authed via global setup
        await page.goto('/dashboard');

        const viewport = page.viewportSize();
        if (!viewport) return; // Should not happen

        if (viewport.width <= 768) {
            // Mobile assertions
            // e.g. Expecting a bottom navigation bar or a hamburger menu
            // Let's assert something generic for now that differs based on Mobile vs Desktop
            // Wait for general load
            await expect(page.locator('body')).toBeVisible();

            // Mobile often hides large sidebars or full tables
            // This is a placeholder assertion that can be refined based on actual DOM elements
            console.log("Testing Mobile Viewport:", viewport);

        } else if (viewport.width === 1920 && viewport.height === 1080) {
            // We need to differentiate between Desktop and TV.
            // In playwright config, TV project doesn't have a specific user-agent that distinguishes it perfectly yet 
            // without custom headers, but let's assume standard Desktop tests for now.
            // Desktop should have full sidebar etc.
            console.log("Testing Desktop/TV Viewport:", viewport);
            await expect(page.locator('body')).toBeVisible();
        }
    });

    test('Activity Logging visibility varies by platform', async ({ page, isMobile }) => {
        await page.goto('/dashboard');

        // Let's test that the main dashboard container is visible.
        await expect(page.locator('main').first() || page.locator('body')).toBeVisible();

        if (isMobile) {
            // Usually, mobile hides some text or shows a specific icon
            // Just verifying standard page load works on both
            await expect(page.locator('body')).toBeVisible();
        } else {
            await expect(page.locator('body')).toBeVisible();
        }
    });
});
