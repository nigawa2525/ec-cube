import { test, expect } from '@playwright/test';

const adminRoute = process.env.ECCUBE_ADMIN_ROUTE || 'admin';

test.describe('Admin Shipping (EA09)', () => {

  test('shipping_csv_template_download - EA0903-UC04-T03', async ({ page }) => {
    // Navigate to shipping CSV upload page
    await page.goto(`/${adminRoute}/order/shipping_csv_upload`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('出荷CSV登録');

    // Download template
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#download-button').click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^shipping\.csv$/);

    // Save and verify content
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });

  test('shipping_csv_upload_page_display - EA0903-UC04', async ({ page }) => {
    // Verify the shipping CSV upload page is accessible and has correct elements
    await page.goto(`/${adminRoute}/order/shipping_csv_upload`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('出荷CSV登録');

    // Verify upload form exists
    await expect(page.locator('#upload-form')).toBeVisible();
    // File input may be visually hidden by CSS styling, check it's attached
    await expect(page.locator('#admin_csv_import_import_file')).toBeAttached();
    await expect(page.locator('#upload-button')).toBeVisible();
    await expect(page.locator('#download-button')).toBeVisible();
  });
});
