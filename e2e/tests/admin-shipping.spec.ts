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

  test('shipping_edit - EA0901-UC03-T01', async ({ page }) => {
    // Navigate to order list and search for all orders
    await page.goto(`/${adminRoute}/order`);
    await page.waitForLoadState('load');
    await page.locator('#search_form .c-outsideBlock__contents button').first().click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Get the first order's edit link
    const firstOrderLink = page.locator('table tbody td a[href*="/order/"]').first();
    await expect(firstOrderLink).toBeVisible();
    const orderEditHref = await firstOrderLink.getAttribute('href');

    // Navigate to order edit page
    await page.goto(orderEditHref!);
    await page.waitForLoadState('load');

    // Find the shipping edit link
    const shippingEditLink = page.locator('a[href*="/shipping/"][href*="/edit"]');
    await expect(shippingEditLink).toBeVisible();
    const shippingEditHref = await shippingEditLink.getAttribute('href');

    // Navigate to shipping edit page
    await page.goto(shippingEditHref!);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('出荷登録');

    // Edit tracking number
    const trackingNumber = 'TEST-TRACK-' + Date.now();
    await page.locator('#form_shippings_0_tracking_number').fill(trackingNumber);

    // Submit
    await page.locator('button.ladda-button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました', { timeout: 30_000 });

    // Verify the tracking number was saved
    await expect(page.locator('#form_shippings_0_tracking_number')).toHaveValue(trackingNumber);
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
