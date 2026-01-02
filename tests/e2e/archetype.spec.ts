import { test, expect } from "@playwright/test";

test.describe("Archetype Selection & Identity", () => {
  test.beforeEach(async ({ page }) => {
    // Already authenticated via storageState
    await page.goto("/"); // Start at dashboard or any protected route to verify session stability
  });

  test.skip("should allow switching archetype and persisting selection", async ({ page }) => {
    // 2. Navigate to Settings
    await page.goto("/settings");
    await expect(page.getByText("Titan Identity", { exact: false })).toBeVisible();

    // 3. Select 'The Iron Juggernaut' (if not already selected)
    // We'll toggle between two to ensure a change happens.
    const muggernautButton = page.getByRole("button", { name: "The Iron Juggernaut" });
    const wardenButton = page.getByRole("button", { name: "The Hybrid Warden" });

    // Check which one is active (by checking for the checkmark or class)
    // Simpler: Just click one that isn't the current default (Warden is default)
    await muggernautButton.click();

    // 4. Verify Immediate Feedback (Active State)
    await expect(muggernautButton).toHaveClass(/border-red-500/);

    // 5. Reload to persist
    await page.reload();
    await expect(muggernautButton).toHaveClass(/border-red-500/);

    // Switch back to Warden to clean up
    await wardenButton.click();
    // Check that Warden button is now selected (has a border indicating selection)
    await expect(wardenButton).toHaveAttribute('class', /border-(purple|zinc|white)/);
  });

  test.skip("should reflect buffs on dashboard", async ({ page }) => {
    // 1. Ensure we are on Juggernaut for the buff test (assuming Juggernaut gives buffs/modifiers in builds.ts)
    // Actually, visual buffs depend on 'TitanLoadMultiplier' which comes from Skill Context + Analytics
    // For this E2E, we mainly check if the Dashboard loads without error after an archetype switch.

    await page.goto("/settings");
    await page.getByRole("button", { name: "The Iron Juggernaut" }).click();

    await page.goto("/");
    await expect(page.getByText("Ultrathink Engine")).toBeVisible();

    // Check for Titan Load widget existence
    await expect(page.getByText("Titan Load")).toBeVisible();
  });
});
