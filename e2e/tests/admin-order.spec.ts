import { test, expect } from '@playwright/test';

const adminRoute = process.env.ECCUBE_ADMIN_ROUTE || 'admin';
const pageTitle = '.c-pageTitle';
const searchResultMsg = '#search_form #search_total_count';
const searchErrorMsg = '.c-contentsArea__primaryCol .text-center';

async function goOrderList(page: import('@playwright/test').Page) {
  await page.goto(`/${adminRoute}/order`);
  await page.waitForLoadState('load');
}

async function searchOrder(page: import('@playwright/test').Page, keyword: string = '') {
  await page.locator('#admin_search_order_multi').fill(keyword);
  await page.locator('#search_form #search_submit').click();
  await page.waitForLoadState('load');
}

async function createOrderViaUI(page: import('@playwright/test').Page, name01: string, name02: string) {
  await page.goto(`/${adminRoute}/order/new`);
  await page.waitForLoadState('load');

  // Fill orderer information
  await page.locator('#order_Payment').selectOption({ index: 1 });
  await page.locator('#order_name_name01').fill(name01);
  await page.locator('#order_name_name02').fill(name02);
  await page.locator('#order_kana_kana01').fill('テスト');
  await page.locator('#order_kana_kana02').fill('タロウ');
  await page.locator('#order_postal_code').fill('060-0000');
  await page.locator('#order_address_pref').selectOption({ label: '北海道' });
  await page.locator('#order_address_addr01').fill('札幌市');
  await page.locator('#order_address_addr02').fill('1-1-1');
  await page.locator('#order_email').fill('test@test.com');
  await page.locator('#order_phone_number').fill('111-111-111');

  // Copy orderer info to shipping
  await page.locator('button.copy-customer').click();
  await page.waitForTimeout(500);

  // Select delivery company
  await page.locator('#order_Shipping_Delivery').selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // Add a product (search for a specific product without class categories)
  await page.locator('#orderItem a.add').click();
  await page.waitForSelector('#addProduct', { state: 'visible' });
  await page.locator('#admin_search_product_id').fill('チェリーアイスサンド');
  await page.locator('#searchProductModalButton').click();
  await page.waitForSelector('#searchProductModalList table', { state: 'visible' });
  await page.locator('#searchProductModalList table button').first().click();
  await expect(page.locator('#addProduct')).not.toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(500);

  // Submit the form (register button)
  await page.locator('#form1 button[value="register"]').click();
  await page.waitForLoadState('load');
  await page.waitForTimeout(3000);

  await expect(page.locator('.alert-success').first()).toContainText('保存しました');
}

test.describe('Admin Order (EA04)', () => {
  test.describe.configure({ mode: 'serial' });

  test('order_受注登録 (EA0405-UC01-T01)', async ({ page }) => {
    // Create an order via the new order form
    await page.goto(`/${adminRoute}/order/new`);
    await page.waitForLoadState('load');

    // Submit empty form -- should not show success (validation error expected)
    await page.locator('#form1 button[value="register"]').click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);
    // The success message should not appear in the content area
    await expect(page.locator('div.c-contentsArea > div.alert-success')).not.toBeVisible();

    // Fill correct data
    await page.locator('#order_Payment').selectOption({ index: 1 });
    await page.locator('#order_name_name01').fill('order1');
    await page.locator('#order_name_name02').fill('order1');
    await page.locator('#order_kana_kana01').fill('アアア');
    await page.locator('#order_kana_kana02').fill('アアア');
    await page.locator('#order_postal_code').fill('060-0000');
    await page.locator('#order_address_pref').selectOption({ label: '北海道' });
    await page.locator('#order_address_addr01').fill('bbb');
    await page.locator('#order_address_addr02').fill('bbb');
    await page.locator('#order_email').fill('test@test.com');
    await page.locator('#order_phone_number').fill('111-111-111');

    // Copy orderer info to shipping
    await page.locator('button.copy-customer').click();
    await page.waitForTimeout(500);

    // Select delivery company
    await page.locator('#order_Shipping_Delivery').selectOption({ index: 1 });
    await page.waitForTimeout(500);

    // Add a product: search for チェリーアイスサンド
    await page.locator('#orderItem a.add').click();
    await page.waitForSelector('#addProduct', { state: 'visible' });
    await page.locator('#admin_search_product_id').fill('チェリーアイスサンド');
    await page.locator('#searchProductModalButton').click();
    await page.waitForSelector('#searchProductModalList table', { state: 'visible' });
    // Select first product (no class categories, modal auto-closes)
    await page.locator('#searchProductModalList table button').first().click();
    await expect(page.locator('#addProduct')).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Submit the form
    await page.locator('#form1 button[value="register"]').click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    await expect(page.locator('.alert-success').first()).toContainText('保存しました');
  });

  test('order_受注編集 (EA0401-UC05)', async ({ page }) => {
    // Search for the order we just created
    await goOrderList(page);
    await searchOrder(page, 'order1');
    await expect(page.locator(searchResultMsg)).not.toContainText('検索結果：0件が該当しました');

    // Click edit on first row
    await page.locator('#search_result tbody tr:first-child a.action-edit').click();
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('受注登録');

    // Open orderer panel (collapsed by default on edit page)
    await page.locator('a[href="#ordererInfo"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#ordererInfo')).toBeVisible();

    // Clear name and submit -- should show validation error
    await page.locator('#order_name_name01').fill('');
    await page.locator('#form1 button[value="register"]').click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    // Error should be visible (入力されていません)
    await expect(page.locator('#ordererInfo')).toContainText('入力されていません');

    // Fill correct data and save
    await page.locator('#order_name_name01').fill('aaa');
    await page.locator('#order_kana_kana01').fill('アアア');
    await page.locator('#order_kana_kana02').fill('アアア');
    await page.locator('#order_postal_code').fill('060-0000');
    await page.locator('#order_address_pref').selectOption({ label: '北海道' });
    await page.locator('#order_address_addr01').fill('bbb');
    await page.locator('#order_address_addr02').fill('address 2');
    await page.locator('#order_phone_number').fill('111-111-111');
    await page.locator('#order_Payment').selectOption({ label: '郵便振替' });

    await page.locator('#form1 button[value="register"]').click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    await expect(page.locator('.alert-success').first()).toContainText('保存しました');

    // Change order status to 入金済み
    await page.locator('#order_OrderStatus').selectOption({ label: '入金済み' });
    await page.locator('#form1 button[value="register"]').click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    await expect(page.locator('.alert-success').first()).toContainText('保存しました');
  });

  test('order_受注検索 (EA0401-UC01-T01)', async ({ page }) => {
    // Search all orders
    await goOrderList(page);
    await searchOrder(page, '');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);
    await expect(page.locator(searchResultMsg)).not.toContainText('検索結果：0件が該当しました');

    // Search by name
    await goOrderList(page);
    await searchOrder(page, 'order1');
    await expect(page.locator(searchResultMsg)).not.toContainText('検索結果：0件が該当しました');

    // Search with no results
    await goOrderList(page);
    await searchOrder(page, 'gege@gege.com');
    await expect(page.locator(searchResultMsg)).toContainText('検索結果：0件が該当しました');

    // Search with invalid phone number (detail search)
    await goOrderList(page);
    // Open detail search
    await page.locator('#search_form a:has(i)').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('#searchDetail')).toBeVisible();
    await page.locator('#admin_search_order_phone_number').fill('あああ');
    await page.locator('#search_form #search_submit').click();
    await page.waitForLoadState('load');
    await expect(page.locator(searchErrorMsg).first()).toContainText('検索条件に誤りがあります');
  });

  test('order_受注CSVダウンロード (EA0401-UC02-T01)', async ({ page }) => {
    await goOrderList(page);
    await searchOrder(page, '');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);
    await expect(page.locator(searchResultMsg)).not.toContainText('検索結果：0件が該当しました');

    // Click CSV download dropdown and download order CSV
    await page.locator('#csvDownloadDropDown').click();
    await page.waitForTimeout(500);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#orderCsvDownload').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^order_\d{14}\.csv$/);
  });

  test('order_受注情報のCSV出力項目変更設定 (EA0401-UC02-T02)', async ({ page }) => {
    await goOrderList(page);
    await searchOrder(page, '');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);

    // Click CSV setting dropdown and navigate to order CSV settings
    await page.locator('#csvSettingDropDown').click();
    await page.waitForTimeout(500);
    await page.locator('#orderCsvSetting').click();
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('CSV出力項目設定');

    // Verify CSV type is 3 (order CSV)
    const csvTypeValue = await page.locator('#csv-type').inputValue();
    expect(csvTypeValue).toBe('3');
  });

  test('order_配送CSVダウンロード (EA0401-UC03-T01)', async ({ page }) => {
    await goOrderList(page);
    await searchOrder(page, '');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);
    await expect(page.locator(searchResultMsg)).not.toContainText('検索結果：0件が該当しました');

    // Click CSV download dropdown and download shipping CSV
    await page.locator('#csvDownloadDropDown').click();
    await page.waitForTimeout(500);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#shippingCsvDownload').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^shipping_\d{14}\.csv$/);
  });

  test('order_配送情報のCSV出力項目変更設定 (EA0401-UC03-T02)', async ({ page }) => {
    await goOrderList(page);
    await searchOrder(page, '');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);

    // Click CSV setting dropdown and navigate to shipping CSV settings
    await page.locator('#csvSettingDropDown').click();
    await page.waitForTimeout(500);
    await page.locator('#shippingCsvSetting').click();
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('CSV出力項目設定');

    // Verify CSV type is 4 (shipping CSV)
    const csvTypeValue = await page.locator('#csv-type').inputValue();
    expect(csvTypeValue).toBe('4');
  });

  test('order_一覧でのソート (EA0401-UC09-T01)', async ({ page }) => {
    // Create a second order to have something to sort
    await createOrderViaUI(page, 'ソートテスト', '二郎');

    await goOrderList(page);
    await searchOrder(page, '');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);
    await expect(page.locator(searchResultMsg)).not.toContainText('検索結果：0件が該当しました');

    // Sort by order_status ascending
    await page.locator('a[data-sortkey="order_status"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.listSort-current[data-sortkey="order_status"] .fa-arrow-up')).toBeVisible();

    // Sort by order_status descending
    await page.locator('a[data-sortkey="order_status"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.listSort-current[data-sortkey="order_status"] .fa-arrow-down')).toBeVisible();

    // Sort by purchase_price ascending
    await page.locator('[data-sortkey="purchase_price"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.listSort-current[data-sortkey="purchase_price"] .fa-arrow-up')).toBeVisible();

    // Sort by purchase_price descending
    await page.locator('a[data-sortkey="purchase_price"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.listSort-current[data-sortkey="purchase_price"] .fa-arrow-down')).toBeVisible();
  });

  test('order_受注編集ページへの遷移', async ({ page }) => {
    await goOrderList(page);
    await searchOrder(page, '');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);

    // Click edit link on first row
    await page.locator('#search_result tbody tr:first-child a.action-edit').click();
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('受注登録');
    expect(page.url()).toMatch(/\/admin\/order\/\d+\/edit$/);
  });
});
