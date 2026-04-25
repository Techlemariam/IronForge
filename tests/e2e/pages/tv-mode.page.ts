import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class TVModePage extends BasePage {
  readonly tvContainer: Locator;
  readonly raidTarget: Locator;
  readonly sensorBtn: Locator;
  readonly sensorManager: Locator;

  constructor(page: any) {
    super(page);
    this.tvContainer = this.page.locator('.fixed.inset-0.bg-black');
    this.raidTarget = this.page.getByText('Guild Raid Target');
    this.sensorBtn = this.page.locator(
      'button:has(.lucide-bluetooth), button:has(.lucide-bluetooth-off)'
    );
    this.sensorManager = this.page.getByText('Connect Sensors');
  }

  async launch() {
    await this.page.keyboard.press('t');
    await this.tvContainer.waitFor({ state: 'visible', timeout: 5000 });
  }

  async toggleHUD() {
    await this.page.keyboard.press('Space');
  }

  async exit() {
    await this.page.keyboard.press('Escape');
    await this.tvContainer.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async openSensorManager() {
    await this.sensorBtn.click();
    await this.sensorManager.waitFor({ state: 'visible' });
  }
}
