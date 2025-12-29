import { test, expect } from '@playwright/test';

test.describe('Game Systems', () => {

    test('should load the Armory page', async ({ page }) => {
        await page.goto('/armory');
        // Check for "Scanning Inventory" or actual equipment content
        await expect(page.getByText(/Armory|Scanning Inventory|Equipment/i)).toBeVisible({ timeout: 10000 });
    });

    test('should load the Colosseum page', async ({ page }) => {
        await page.goto('/colosseum');
        // Check for "Iron Colosseum" header or "Gladiators" count
        await expect(page.getByText(/Iron Colosseum|Gladiators|Enter Arena/i)).toBeVisible({ timeout: 10000 });
    });

    test('should load the Bestiary page', async ({ page }) => {
        await page.goto('/bestiary');
        // Check for "The Bestiary" header or "Enemies Defeated"
        await expect(page.getByText(/Bestiary|Enemies Defeated|Lore Unlocked/i)).toBeVisible({ timeout: 10000 });
    });

    test('should load the World Map page', async ({ page }) => {
        await page.goto('/map');
        // Check for Map related content (Region or World Map text)
        await expect(page.getByText(/Map|Region|World|Iron Forge/i)).toBeVisible({ timeout: 10000 });
    });

});
