import { test, expect } from '@playwright/test';

test.describe('TV Mode (Iron Command Center)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to Training Page where TV mode can be launched
        // Assuming standard login or access pattern. 
        // For now, we might need to mock auth or access layout directly if possible.
        // Let's assume /training route exists.
        await page.goto('/training');
    });

    test('should launch TV Mode via keyboard shortcut', async ({ page }) => {
        // Press 'T' to launch TV Mode
        await page.keyboard.press('t');

        // Check if TV Mode container is visible
        const tvContainer = page.locator('.fixed.inset-0.bg-black');
        await expect(tvContainer).toBeVisible();

        // Check for HUD elements
        await expect(page.getByText('Zone 1')).toBeVisible();
        await expect(page.getByText('Guild Raid Target')).toBeVisible();
    });

    test('should toggle HUD visibility with Spacebar', async ({ page }) => {
        await page.keyboard.press('t');
        await expect(page.locator('.fixed.inset-0.bg-black')).toBeVisible();

        // Press Space to hide HUD
        await page.keyboard.press('Space');
        // We expect the HUD container to disappear or animate out. 
        // Frame motion might remove it from DOM or zero opacity.
        // Our code: {hudVisible && ...} so it removes from DOM.
        await expect(page.getByText('Guild Raid Target')).not.toBeVisible();

        // Press Space to show HUD
        await page.keyboard.press('Space');
        await expect(page.getByText('Guild Raid Target')).toBeVisible();
    });

    test('should open Sensor Manager', async ({ page }) => {
        await page.keyboard.press('t');

        // Click Bluetooth button (we might need a better selector)
        // In TvMode.tsx: button with Bluetooth icon inside "Top HUD"
        // We can search by role button that contains 'Connect' text or icon?
        // The button has specific class or just onClick.
        // Let's rely on the button inside the top right area.

        // Assuming the bluetooth button is visible when HUD is visible.
        // It's in the top right group.

        // We can target the bluetooth icon? 
        // or just page.getByRole('button').filter({ has: page.locator('svg.lucide-bluetooth-off') })

        // Actually, simpler: The SensorManager has text "Connect Sensors" when open.
        // Let's try to find the button. 
        await page.locator('button:has(.lucide-bluetooth-off)').click();

        await expect(page.getByText('Connect Sensors')).toBeVisible();
        await expect(page.getByText('Heart Rate')).toBeVisible();
        await expect(page.getByText('Smart Trainer')).toBeVisible();

        // Close it
        await page.getByText('Done').click();
        await expect(page.getByText('Connect Sensors')).not.toBeVisible();
    });

    test('should exit TV Mode with Escape', async ({ page }) => {
        await page.keyboard.press('t');
        await expect(page.locator('.fixed.inset-0.bg-black')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator('.fixed.inset-0.bg-black')).not.toBeVisible();
    });
});
