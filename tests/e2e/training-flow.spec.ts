import { expect, test } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Training & Cardio Flow', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('should navigate to Cycling Studio', async ({ page }) => {
    await dashboard.startRide();
    await expect(page.getByText(/Cycling|Cardio|Ride/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to Treadmill (Running)', async ({ page }) => {
    await dashboard.startRun();
    await expect(page.getByText(/Running|Treadmill|Cardio/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to Training Center', async ({ page }) => {
    await dashboard.trainingOpsBtn.click();
    await expect(dashboard.cardioFocusBtn).toBeVisible({ timeout: 30000 });
    await dashboard.cardioFocusBtn.click();

    if (await dashboard.trainingPathBtn.isVisible()) {
      await dashboard.trainingPathBtn.click({ force: true });
    } else {
      await page.goto('/training-center');
    }

    await expect(
      page.getByText(/Training|Path|Back to Citadel|Active|WARDEN|JUGGERNAUT/i).first()
    ).toBeVisible({ timeout: 15000 });
  });
});
