import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly passwordToggle: Locator;
  readonly errorMsg: Locator;

  constructor(page: any) {
    super(page);
    this.emailInput = this.page.getByPlaceholder('hunter@ironforge.com');
    this.passwordInput = this.page.locator('input[type="password"]');
    this.loginButton = this.page.getByRole('button', { name: /Initialize Uplink/i });
    this.passwordToggle = this.page.getByText(/Password/i).first();
    this.errorMsg = this.page.locator(
      'div:has-text("Authentication protocol failed"), div:has-text("Invalid login credentials")'
    );
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, pass: string) {
    await this.passwordToggle.click({ force: true });
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);

    // Inject key before login
    await this.injectLocalStorage('hevy_api_key', 'e2e-dummy-key');

    await Promise.all([
      this.page.waitForURL(
        (url) => {
          return (
            url.pathname === '/' || url.pathname === '/welcome' || url.pathname === '/dashboard'
          );
        },
        { timeout: 60000 }
      ),
      this.loginButton.click(),
    ]);

    // Handle onboarding
    await this.dismissOnboarding();

    // Re-inject key to ensure persistence
    await this.injectLocalStorage('hevy_api_key', 'e2e-dummy-key');
  }

  async checkError() {
    if ((await this.errorMsg.count()) > 0 && (await this.errorMsg.first().isVisible())) {
      return await this.errorMsg.first().textContent();
    }
    return null;
  }
}
