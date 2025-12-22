const { test, expect } = require('@playwright/test');

test.describe('Landing Page / Login Redirect', () => {
    test('should redirect to login page for unauthenticated users', async ({ page }) => {
        await page.goto('/');
        // Explicitly wait for the redirect to complete
        await page.waitForURL(/\/login/, { timeout: 15000 });

        // Check for the header text
        await expect(page.locator('h1')).toContainText('Inventory Login', { timeout: 10000 });

        // Check for the sign in button using CSS selector
        const signInButton = page.locator('.login-button');
        await expect(signInButton).toBeVisible({ timeout: 10000 });
        await expect(signInButton).toHaveText(/Sign In/i);
    });

    test('should show Google login option', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('.google-button')).toBeVisible({ timeout: 10000 });
    });
});
