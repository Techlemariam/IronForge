import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly trainingOpsBtn: Locator;
  readonly cardioFocusBtn: Locator;
  readonly rideBtn: Locator;
  readonly runBtn: Locator;
  readonly trainingPathBtn: Locator;
  readonly exitStudioBtn: Locator;

  constructor(page: any) {
    super(page);
    this.trainingOpsBtn = this.page.getByRole('button', { name: /Training Operations/i });
    this.cardioFocusBtn = this.page.getByRole('button', { name: /Cardio Focus/i });
    this.rideBtn = this.page.getByRole('button', { name: 'Ride' });
    this.runBtn = this.page.getByRole('button', { name: 'Run' });
    this.trainingPathBtn = this.page
      .getByRole('button', { name: /Training Path|Training Center|Path|Program/i })
      .first();
    this.exitStudioBtn = this.page.getByTitle('Close (Esc)');
  }

  async goto() {
    await this.page.goto('/dashboard');
    // Ensure API key is set
    await this.injectLocalStorage('hevy_api_key', 'e2e-dummy-key');
    await this.page.waitForTimeout(1500); // Allow stabilization

    // Auto-exit studio if locked
    if (await this.exitStudioBtn.isVisible()) {
      await this.exitStudioBtn.click();
      await this.page.waitForTimeout(500);
    }

    await this.dismissOnboarding();
  }

  async openCardioMenu() {
    await this.trainingOpsBtn.click();
    await this.cardioFocusBtn.waitFor({ state: 'visible' });
    await this.cardioFocusBtn.click();
  }

  async startRide() {
    await this.openCardioMenu();
    await this.rideBtn.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  async startRun() {
    await this.openCardioMenu();
    await this.runBtn.click({ force: true });
    await this.page.waitForTimeout(500);
  }
}
