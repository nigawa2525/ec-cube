import { test, expect } from '@playwright/test';

const adminRoute = process.env.ECCUBE_ADMIN_ROUTE || 'admin';

test.describe('Admin Basic Info (EA07)', () => {
  test.describe.configure({ mode: 'serial' });

  test('basicinfo_shop_settings - EA0701-UC01-T01', async ({ page }) => {
    await page.goto(`/${adminRoute}/setting/shop`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('基本設定');

    await page.locator('#shop_master_company_name').fill('サンプル会社名');
    await page.locator('#shop_master_shop_name').fill('サンプルショップ');
    await page.locator('#shop_master_postal_code').fill('100-0001');
    await page.locator('#shop_master_phone_number').fill('050-5555-5555');

    await page.waitForTimeout(2000);

    await page.locator('button.ladda-button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました', { timeout: 30_000 });

    // Verify on the about page
    await page.goto('/help/about');
    await page.waitForLoadState('load');
    await expect(page.locator('#help_about_box__company_name dd')).toContainText('サンプル会社名');
    await expect(page.locator('#help_about_box__shop_name dd')).toContainText('サンプルショップ');
    await expect(page.locator('#help_about_box__address dd')).toContainText('1000001');
    await expect(page.locator('#help_about_box__phone_number dd')).toContainText('05055555555');
  });

  test('basicinfo_payment_list - EA0704-UC01-T01', async ({ page }) => {
    await page.goto(`/${adminRoute}/setting/shop/payment`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('支払方法一覧');

    // Verify that payment methods are listed
    const count = await page.locator('.c-contentsArea__primaryCol li.sortable-item').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('basicinfo_payment_crud - EA0705-UC01/UC02/EA0704-UC03', async ({ page }) => {
    const paymentName = 'test_payment_' + Date.now();
    const paymentNameEdited = paymentName + '_edited';

    // --- CREATE ---
    await page.goto(`/${adminRoute}/setting/shop/payment`);
    await page.waitForLoadState('load');
    const beforeCount = await page.locator('.c-contentsArea__primaryCol li.sortable-item').count();

    await page.locator('.c-contentsArea__primaryCol .btn-ec-regular').click();
    await page.waitForLoadState('load');

    await page.locator('#payment_register_method').fill(paymentName);
    await page.locator('#payment_register_charge').fill('100');
    await page.locator('#payment_register_rule_min').fill('1');

    await page.locator('#form1 > .c-conversionArea > .c-conversionArea__container button.btn-ec-conversion').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.c-container .c-contentsArea div.alert-success')).toContainText('保存しました');

    // Verify on list
    await page.goto(`/${adminRoute}/setting/shop/payment`);
    await page.waitForLoadState('load');
    const afterCreateCount = await page.locator('.c-contentsArea__primaryCol li.sortable-item').count();
    expect(afterCreateCount).toBe(beforeCount + 1);
    // New payment appears first (nth-child(2) because list has a header item)
    await expect(page.locator('.c-contentsArea__primaryCol .c-primaryCol .card-body ul li:nth-child(2)')).toContainText(paymentName);

    // --- EDIT ---
    await page.locator('.c-contentsArea__primaryCol .list-group-flush .list-group-item:nth-child(2) a[href*="edit"]').click();
    await page.waitForLoadState('load');

    await page.locator('#payment_register_method').fill(paymentNameEdited);
    await page.locator('#payment_register_charge').fill('1000');

    await page.locator('#form1 > .c-conversionArea > .c-conversionArea__container button.btn-ec-conversion').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.c-container .c-contentsArea div.alert-success')).toContainText('保存しました');

    await page.goto(`/${adminRoute}/setting/shop/payment`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-contentsArea__primaryCol .c-primaryCol .card-body ul li:nth-child(2)')).toContainText(paymentNameEdited);

    // --- DELETE ---
    // Click delete on first item (the one we just edited)
    await page.locator('.c-contentsArea__primaryCol .list-group-flush .list-group-item:nth-child(2) a[data-bs-target="#DeleteModal"]').click();
    await page.waitForTimeout(500);
    await page.locator('#DeleteModal').waitFor({ state: 'visible' });
    await page.locator('#DeleteModal > div > div > div.modal-footer > a').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.c-container .c-contentsArea div.alert-success')).toContainText('削除しました');

    // Verify count is back to original
    await page.goto(`/${adminRoute}/setting/shop/payment`);
    await page.waitForLoadState('load');
    const afterDeleteCount = await page.locator('.c-contentsArea__primaryCol li.sortable-item').count();
    expect(afterDeleteCount).toBe(beforeCount);
  });

  test('basicinfo_delivery_list - EA0706-UC01-T01', async ({ page }) => {
    await page.goto(`/${adminRoute}/setting/shop/delivery`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('配送方法一覧');

    // Verify that delivery methods are listed
    const count = await page.locator('.c-contentsArea__primaryCol li.sortable-item').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('basicinfo_delivery_crud - EA0707-UC01/UC02/EA0706-UC03', async ({ page }) => {
    const deliveryName = 'test_delivery_' + Date.now();
    const deliveryNameEdited = deliveryName + '_edited';

    // --- CREATE ---
    await page.goto(`/${adminRoute}/setting/shop/delivery`);
    await page.waitForLoadState('load');
    const beforeCount = await page.locator('.c-contentsArea__primaryCol li.sortable-item').count();

    // Click new registration link
    await page.locator('a[href*="delivery/new"]').click();
    await page.waitForLoadState('load');

    await page.locator('#delivery_name').fill(deliveryName);
    await page.locator('#delivery_service_name').fill('名称');

    // Select payment methods
    await page.locator('#delivery_payments_1').check();
    await page.locator('#delivery_payments_4').check();

    // Add delivery time
    await page.locator('#add-delivery-time-value').fill('<AM>');
    await page.locator('#add-delivery-time-button').click();

    // Set flat rate shipping
    await page.locator('#delivery_free_all').fill('100');
    await page.locator('#set_fee_all').click();

    // Submit
    await page.getByRole('button', { name: '登録' }).click();
    await page.waitForLoadState('load');
    await expect(page.locator('.c-container div.c-contentsArea > div.alert-success')).toContainText('保存しました');

    // Verify on list
    await page.goto(`/${adminRoute}/setting/shop/delivery`);
    await page.waitForLoadState('load');
    const afterCreateCount = await page.locator('.c-contentsArea__primaryCol li.sortable-item').count();
    expect(afterCreateCount).toBe(beforeCount + 1);

    // Find the row with our delivery name
    await expect(page.locator(`div.c-primaryCol ul li:has-text("${deliveryName}")`)).toBeVisible();

    // --- EDIT ---
    // Click edit on the new delivery (it should be at position 2, right after the header)
    await page.locator(`div.c-primaryCol ul li:has-text("${deliveryName}") a[href*="edit"]`).click();
    await page.waitForLoadState('load');

    await page.locator('#delivery_name').fill(deliveryNameEdited);

    await page.getByRole('button', { name: '登録' }).click();
    await page.waitForLoadState('load');
    await expect(page.locator('.c-container div.c-contentsArea > div.alert-success')).toContainText('保存しました');

    // Verify
    await page.goto(`/${adminRoute}/setting/shop/delivery`);
    await page.waitForLoadState('load');
    await expect(page.locator(`div.c-primaryCol ul li:has-text("${deliveryNameEdited}")`)).toBeVisible();

    // --- DELETE ---
    await page.locator(`div.c-primaryCol ul li:has-text("${deliveryNameEdited}") a[data-bs-target="#DeleteModal"]`).click();
    await page.locator('#DeleteModal').waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await page.locator('#DeleteModal > div > div > div.modal-footer > a').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.c-container div.c-contentsArea > div.alert-success')).toContainText('削除しました');

    // Verify count is back to original
    await page.goto(`/${adminRoute}/setting/shop/delivery`);
    await page.waitForLoadState('load');
    const afterDeleteCount = await page.locator('.c-contentsArea__primaryCol li.sortable-item').count();
    expect(afterDeleteCount).toBe(beforeCount);
  });

  test('basicinfo_tax_rate - EA0708-UC01-T01', async ({ page }) => {
    await page.goto(`/${adminRoute}/setting/shop/tax`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('税率設定');

    // Verify 10% is displayed
    await expect(page.locator('#ex-tax_rule-1 > td.align-middle.text-end')).toContainText('10%');

    // Register a new tax rate
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    await page.locator('table tbody tr:nth-child(1) input[type=number]').fill('8');
    await page.evaluate(({ y, m, d }) => {
      const el = document.querySelector('#tax_rule_apply_date') as HTMLInputElement;
      if (el) el.value = `${y}-${m}-${d}T00:00:00`;
    }, { y: year, m: month, d: day });

    await page.locator('table tbody tr:nth-child(1) button').click();
    await page.waitForLoadState('load');
    await expect(page.locator('table > tbody > tr:nth-child(2) > td.align-middle.text-end .list')).toContainText('8%');

    // Edit the new tax rate
    await page.locator('table tbody tr:nth-child(2) .edit-button').click();
    await page.locator('table tbody tr:nth-child(2) input[type=number]').fill('12');
    await page.locator('table tbody tr:nth-child(2) > td > div.edit > button.btn.btn-ec-conversion').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.c-container .c-contentsArea .alert-success')).toContainText('保存しました');
    await expect(page.locator('table > tbody > tr:nth-child(2) > td.align-middle.text-end .list')).toContainText('12%');

    // Delete the new tax rate
    await page.locator('table tbody tr:nth-child(2) > td.align-middle.action > div > div > div:nth-child(2) > div.d-inline-block.me-3 > a').click();
    await page.locator('table tbody tr:nth-child(2) > td.align-middle.action > div > div > div:nth-child(2) > div.modal').waitFor({ state: 'visible' });
    await page.locator('table tbody tr:nth-child(2) > td.align-middle.action > div > div > div:nth-child(2) > div.modal.fade.show > div > div > div.modal-footer > a').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.c-container .c-contentsArea .alert-success')).toContainText('削除しました');
  });

  test('basicinfo_mail_settings - EA0709-UC02-T01', async ({ page }) => {
    const title = '商品出荷のお知らせ ' + Date.now();

    await page.goto(`/${adminRoute}/setting/shop/mail`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('メール設定');

    // Select template - this triggers an AJAX load of the template content
    await page.locator('#mail_template').selectOption({ label: '出荷通知メール' });
    // Wait for the subject field to be populated by the template load
    await page.waitForTimeout(2000);
    await expect(page.locator('#mail_mail_subject')).toBeVisible();

    // Edit subject
    await page.locator('#mail_mail_subject').fill(title);

    // Save
    await page.locator('button.ladda-button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました', { timeout: 30_000 });
  });

  test('basicinfo_csv_settings - EA0710-UC01-T01', async ({ page }) => {
    await page.goto(`/${adminRoute}/setting/shop/csv`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('CSV出力項目設定');

    // Select CSV type
    await page.locator('#csv-type').selectOption({ label: '受注CSV' });
    await page.waitForTimeout(2000);

    // First, ensure "誕生日" is in the output list (it may have been removed by a prior run)
    const notOutputOptions = await page.locator('#csv-not-output option').allTextContents();
    if (notOutputOptions.some(o => o.includes('誕生日'))) {
      // Add it back to the output list first
      await page.locator('#csv-not-output').selectOption({ label: '誕生日' });
      await page.locator('#add').click();
      await page.locator('#csv-form > div.c-conversionArea > div > div > div:nth-child(2) > div > div > button').click();
      await page.waitForLoadState('load');
      await expect(page.locator('.alert-success')).toContainText('保存しました');

      // Reload and re-select CSV type
      await page.goto(`/${adminRoute}/setting/shop/csv`);
      await page.waitForLoadState('load');
      await page.locator('#csv-type').selectOption({ label: '受注CSV' });
      await page.waitForTimeout(2000);
    }

    // Now select "誕生日" from output list and remove it
    await page.locator('#csv-output').selectOption({ label: '誕生日' });
    await page.locator('#remove').click();

    // Save settings
    await page.locator('#csv-form > div.c-conversionArea > div > div > div:nth-child(2) > div > div > button').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
  });

  test('basicinfo_order_status_settings - EA0711-UC01-T01', async ({ page }) => {
    await page.goto(`/${adminRoute}/setting/shop/order_status`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('受注対応状況設定');

    // Edit first order status
    await page.locator('#form_OrderStatuses_0_name').fill('新規受付');
    await page.locator('#form_OrderStatuses_0_customer_order_status_name').fill('注文受付');
    await page.locator('#form_OrderStatuses_0_color').fill('#19406C');

    // Submit
    await page.locator('#ex-conversion-action > div > button').click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
    await expect(page.locator('#page_admin_setting_shop_order_status .alert-success')).toContainText('保存しました', { timeout: 30_000 });

    // Verify
    await page.goto(`/${adminRoute}/setting/shop/order_status`);
    await page.waitForLoadState('load');
    await expect(page.locator('#form_OrderStatuses_0_customer_order_status_name')).toHaveValue('注文受付');
    await expect(page.locator('#form_OrderStatuses_0_name')).toHaveValue('新規受付');
  });

  test('basicinfo_calendar_settings - EA0712-UC01-T01/T02', async ({ page }) => {
    await page.goto(`/${adminRoute}/setting/shop/calendar`);
    await page.waitForLoadState('load');
    await expect(page.locator('.c-pageTitle')).toContainText('定休日カレンダー');

    // Delete any existing holidays to avoid "already exists" conflicts
    while (true) {
      const deleteButtons = page.locator('table tbody tr a[data-bs-toggle="modal"]');
      const count = await deleteButtons.count();
      if (count === 0) break;
      await deleteButtons.first().click();
      await page.waitForTimeout(500);
      // Click the delete confirmation button in the modal
      await page.locator('.modal.show .btn-ec-delete').click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(500);
    }

    // Use dates far enough in the future to avoid conflicts
    const now = new Date();
    const year = now.getFullYear() + 1; // next year to avoid conflicts
    const date1 = `${year}-01-15`;
    const date2 = `${year}-02-15`;

    // Set holiday 1
    await page.locator('#calendar_item_new #calendar_title').fill('定休日テスト1');
    await page.evaluate((date) => {
      const el = document.querySelector('#calendar_item_new #calendar_holiday') as HTMLInputElement;
      if (el) el.value = date;
    }, date1);
    await page.locator('#calendar_item_new button').click();
    await page.waitForLoadState('load');
    await expect(page.locator('#page_admin_setting_shop_calendar .alert-success')).toContainText('保存しました');

    // Set holiday 2
    await page.goto(`/${adminRoute}/setting/shop/calendar`);
    await page.waitForLoadState('load');

    await page.locator('#calendar_item_new #calendar_title').fill('定休日テスト2');
    await page.evaluate((date) => {
      const el = document.querySelector('#calendar_item_new #calendar_holiday') as HTMLInputElement;
      if (el) el.value = date;
    }, date2);
    await page.locator('#calendar_item_new button').click();
    await page.waitForLoadState('load');
    await expect(page.locator('#page_admin_setting_shop_calendar .alert-success')).toContainText('保存しました');
  });
});
