import type { Locator, Page } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;
  protected readonly mainContent: Locator;
  protected readonly configScreen: Locator;
  protected readonly onboardingOverlay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainContent = page.locator('#main-content');
    this.configScreen = page.locator('#config-screen');
    this.onboardingOverlay = page.locator(
      'h2:has-text("Awaken, Titan"), button:has-text("I Swear It")'
    );
  }

  async injectLocalStorage(key: string, value: string) {
    await this.page.evaluate(
      ({ k, v }) => {
        localStorage.setItem(k, v);
      },
      { k: key, v: value }
    );
  }

  async dismissOnboarding() {
    let attempts = 0;
    while (attempts < 5) {
      if (!(await this.onboardingOverlay.first().isVisible())) break;

      console.log(`Dismissing onboarding (attempt ${attempts + 1})...`);
      const nextButton = this.page
        .locator('button:has-text("Continue"), button:has-text("I Swear It")')
        .first();

      if (await nextButton.isVisible()) {
        await nextButton.click();
        await this.page.waitForTimeout(2000); // Wait for animation/DB update
      }
      attempts++;
    }

    const overlay = this.page.locator('.fixed.inset-0.z-\\[100\\]');
    if (await overlay.isVisible()) {
      await overlay.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
        console.log('Overlay did not disappear in time!');
      });
    }
  }

  async waitForMainContent() {
    await this.mainContent.waitFor({ state: 'visible', timeout: 90000 });
  }
}
