import { test, expect } from '@playwright/test';

test.describe('Game Systems', () => {

    test('should load the Armory page', async ({ page }) => {
        await page.goto('/armory');
        // Check for Armory header or content
        await expect(page.getByText(/Armory|Scanning Inventory|Equipment/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should load the Colosseum page', async ({ page }) => {
        await page.goto('/colosseum');
        // Check for "Iron Colosseum" header or "Gladiators" count  
        await expect(page.getByText(/Iron Colosseum|Gladiators|Enter Arena|Find Match/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should load the Bestiary page', async ({ page }) => {
        await page.goto('/bestiary');
        // Check for "The Bestiary" header or "Enemies Defeated"
        await expect(page.getByText(/Bestiary|Enemies Defeated|Lore Unlocked/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should load the World Map page', async ({ page }) => {
        await page.goto('/map');
        // Check for Map related content - "Known World" is the actual header
        await expect(page.getByText(/Known World|Scouting Terrain|Return to Citadel/i).first()).toBeVisible({ timeout: 15000 });
    });

});
