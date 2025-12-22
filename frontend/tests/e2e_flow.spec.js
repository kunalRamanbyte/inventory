const { test, expect } = require('@playwright/test');
const { randomUUID } = require('crypto');

test.describe('Inventory Management E2E', () => {
    const TEST_USER = {
        email: 'kunal@gmail.com',
        password: '123456'
    };

    test('User can login, add a random item, and verify it exists', async ({ page }) => {

        // Step 1: Login
        await test.step('Login to application', async () => {
            await page.goto('/login');

            // Fill login form
            await page.fill('input[type="email"]', TEST_USER.email);
            await page.fill('input[type="password"]', TEST_USER.password);

            // Submit and wait for navigation
            await page.click('.login-button');
            await expect(page).toHaveURL('/');

            // Verify dashboard loaded
            await expect(page.locator('h1.logo')).toContainText('InventoryPro');
        });

        // Generate random item data
        const randomItem = {
            name: `Test Item ${randomUUID().substring(0, 8)}`,
            description: `Description for test item ${randomUUID().substring(0, 8)}`,
            price: (Math.random() * 100).toFixed(2),
            quantity: Math.floor(Math.random() * 50) + 1
        };

        // Step 2: Add Item
        await test.step('Add new inventory item', async () => {
            // Open modal
            await page.click('button:has-text("+ Add Item")');
            await expect(page.getByRole('heading', { name: 'Create New Inventory Record' })).toBeVisible();

            // Fill modal form
            // Note: Using placeholders as selectors based on inspection
            await page.fill('input[placeholder="e.g. Sony PlayStation 5"]', randomItem.name);
            await page.fill('textarea[placeholder="Briefly describe the item..."]', randomItem.description);
            await page.fill('input[placeholder="0.00"]', randomItem.price.toString());
            await page.fill('input[placeholder="1"]', randomItem.quantity.toString());

            // Submit
            await page.click('button:has-text("Register Item")');

            // Wait for modal to close
            await expect(page.getByRole('heading', { name: 'Create New Inventory Record' })).toBeHidden();
        });

        // Step 3: Verify Data
        await test.step('Verify item is added to the list', async () => {
            // Search for the item to filter the list (handling pagination/scroll if it were large)
            // or just wait for it to appear in the table

            // We look for a row that contains our unitique item name
            const row = page.locator('tr', { hasText: randomItem.name });
            await expect(row).toBeVisible();

            // Verify details in that row
            await expect(row).toContainText(randomItem.name);
            // Validating price format in table (might have $ prefix)
            await expect(row).toContainText(randomItem.price);
            await expect(row).toContainText(`${randomItem.quantity} units`);
        });
    });
});
