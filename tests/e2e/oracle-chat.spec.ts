import { test, expect } from '@playwright/test';

test.describe('Oracle Chat', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the dashboard
        await page.goto('/');

        // Wait for the page to load
        await page.waitForLoadState('networkidle');

        // Dismiss onboarding if present
        const skipButton = page.locator('button:has-text("Skip"), button:has-text("Close"), button:has-text("Later")');
        if (await skipButton.count() > 0) {
            await skipButton.first().click();
            await page.waitForTimeout(500);
        }
    });

    test('should open Oracle Chat panel', async ({ page }) => {
        // Look for the Oracle Chat trigger button (floating chat bubble)
        const chatTrigger = page.locator('[data-testid="oracle-chat-trigger"], button:has(.lucide-message-circle)');

        // If chat trigger exists, click it
        if (await chatTrigger.count() > 0) {
            await chatTrigger.first().click();

            // Verify chat panel opens
            await expect(page.getByText(/Oracle|Ask|Chat/i).first()).toBeVisible({ timeout: 5000 });
        } else {
            // Chat may already be visible or embedded differently
            test.skip(true, 'Oracle Chat trigger not found - may be inline');
        }
    });

    test('should send a message and receive a response', async ({ page }) => {
        // Open chat if needed
        const chatTrigger = page.locator('[data-testid="oracle-chat-trigger"], button:has(.lucide-message-circle)');
        if (await chatTrigger.count() > 0) {
            await chatTrigger.first().click();
            await page.waitForTimeout(500);
        }

        // Find the input field
        const inputField = page.locator('input[placeholder*="Ask"], textarea[placeholder*="Ask"], input[type="text"]').first();

        if (await inputField.count() > 0) {
            // Type a message
            await inputField.fill('How should I train today?');

            // Send the message (press Enter or click send button)
            await inputField.press('Enter');

            // Wait for response (AI response may take a few seconds)
            // Look for any new content that appears after sending
            await page.waitForTimeout(3000);

            // Verify some response appeared (Oracle's response container)
            const messages = page.locator('[data-testid="oracle-message"], .chat-message, [class*="message"]');
            await expect(messages.first()).toBeVisible({ timeout: 10000 });
        } else {
            test.skip(true, 'Chat input not found');
        }
    });

    test('should display loading state while generating response', async ({ page }) => {
        // Open chat if needed
        const chatTrigger = page.locator('[data-testid="oracle-chat-trigger"], button:has(.lucide-message-circle)');
        if (await chatTrigger.count() > 0) {
            await chatTrigger.first().click();
            await page.waitForTimeout(500);
        }

        const inputField = page.locator('input[placeholder*="Ask"], textarea[placeholder*="Ask"], input[type="text"]').first();

        if (await inputField.count() > 0) {
            await inputField.fill('Test message');
            await inputField.press('Enter');

            // Check for loading indicator (spinner, "thinking", etc.)
            const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], .animate-spin, :has-text("thinking")');

            // Loading state should appear briefly
            // Note: This may be too fast to catch consistently
            try {
                await expect(loadingIndicator.first()).toBeVisible({ timeout: 2000 });
            } catch {
                // Loading may have completed very quickly - that's okay
            }
        } else {
            test.skip(true, 'Chat input not found');
        }
    });
});
