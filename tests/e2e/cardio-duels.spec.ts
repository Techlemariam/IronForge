import { test, expect } from '@playwright/test';
import { Client } from 'pg';

// Seeded mock opponents are now available via e2e-seed.ts in CI.
test.describe('Cardio PvP Duels Flow', () => {
    test.beforeAll(async () => {
        // Use direct PG connection to avoid Prisma instantiation issues in test env
        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        try {
            await client.connect();
            const email = process.env.TEST_USER_EMAIL || 'alexander.teklemariam@gmail.com';
            console.log(`[Setup] Cleaning up duels for user: ${email} `);

            const userRes = await client.query('SELECT id, "heroName" FROM "User" WHERE email = $1', [email]);
            if (userRes.rows.length === 0) {
                throw new Error(`Test user not found: ${email} `);
            }
            const user = userRes.rows[0];

            // Clean up DuelChallenge
            const result = await client.query(
                'DELETE FROM "DuelChallenge" WHERE "challengerId" = $1 OR "defenderId" = $1',
                [user.id]
            );
            console.log(`[Setup] Deleted ${result.rowCount} active duels for ${user.heroName || user.id}`);

            // Ensure Titan exists and matches opponent power range (500)
            await client.query(`
                INSERT INTO "Titan" ("id", "userId", "name", "level", "powerRating", "strength", "endurance", "agility", "vitality", "willpower", "createdAt", "updatedAt", "lastActive")
                VALUES (gen_random_uuid(), $1, 'Test Titan', 5, 500, 10, 10, 10, 10, 10, NOW(), NOW(), NOW())
                ON CONFLICT ("userId") 
                DO UPDATE SET "powerRating" = 500, "level" = 5, "updatedAt" = NOW();
            `, [user.id]);
            console.log(`[Setup] Updated Titan power rating to 500 for matchmaking`);

        } catch (e) {
            console.error("[Setup] Cleanup failed:", e);
            throw e;
        } finally {
            await client.end();
        }
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/iron-arena');

        // CRITICAL: Inject API key to bypass "Configuration Required" screen
        await page.evaluate(() => {
            localStorage.setItem('hevy_api_key', 'e2e-dummy-key');
        });

        // Wait for hydration
        await page.waitForTimeout(1500);

        const findOpponentBtn = page.getByRole('button', { name: 'Find Opponent' });
        if (!await findOpponentBtn.isVisible()) {
            console.log("Find Opponent button not visible. Page content dump:");
            console.log(await page.textContent('body'));

            // Try to recover if we are in Victory screen?
            if (await page.getByText(/Victory/i).isVisible()) {
                console.log("Stuck on victory screen?");
            }
        }

        // Open Find Opponent
        await findOpponentBtn.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText(/Issue Challenge/i)).toBeVisible();

        // Select Opponent (First available with Level)
        // Use a more generic selector that waits for hydration
        const opponentButton = page.locator('button').filter({ hasText: /Lvl/i }).first();
        await expect(opponentButton).toBeVisible({ timeout: 15000 });
        await opponentButton.click();

        // Challenge Action
        await page.getByRole('button', { name: 'Challenge Titan' }).click();

        // Verify Wizard is open before tests start
        await expect(page.getByText('Create Cardio Duel')).toBeVisible();
    });

    test('should display default wizard state correctly', async ({ page }) => {
        // Defaults: Cycling selected
        await expect(page.getByText('Cycling')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cycling', pressed: true })).toBeVisible();
        await expect(page.getByText('Running')).toBeVisible();
        await expect(page.getByText('Distance Race')).toBeVisible();
    });

    test('should allow configuring a Speed Demon cycling duel', async ({ page }) => {
        // Select Speed Demon
        await page.click('button:has-text("Speed Demon")'); // Text selector is reliable for these big cards

        // Verify Distance Options appear
        await expect(page.getByText('Target Distance (km)')).toBeVisible();

        // Use exact check for button visibility
        const dist20 = page.getByRole('button', { name: '20km' });
        await expect(dist20).toBeVisible();
        await dist20.click();

        // Check W/kg slider existence (since Cycling is default)
        await expect(page.getByText('Fairness Tier (W/kg)')).toBeVisible();

        // Check Submit Button
        await expect(page.getByRole('button', { name: 'Challenge Titan' })).toBeEnabled();
    });

    test('should switch to Running mode options', async ({ page }) => {
        // Switch to Running
        await page.getByRole('button', { name: 'Running' }).click();

        // Small wait for state update
        await page.waitForTimeout(500);

        // Verify Running is selected - Use a more robust check if aria-pressed is slow
        const runningBtn = page.getByRole('button', { name: 'Running' });
        await expect(runningBtn).toHaveAttribute('aria-pressed', 'true');
        await expect(runningBtn).toBeVisible();

        // Verify W/kg slider is GONE (Running doesn't have it currently in MVP)
        await expect(page.getByText('Fairness Tier (W/kg)')).not.toBeVisible();


        // Verify Speed Demon distances for running
        await page.click('button:has-text("Speed Demon")');

        // Running typically has shorter distances in config, check for 5km
        await expect(page.getByRole('button', { name: '5km' })).toBeVisible();
    });
});
