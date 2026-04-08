import { test, expect } from '@playwright/test';

const adminRoute = process.env.ECCUBE_ADMIN_ROUTE || 'admin';
const pageTitle = '.c-pageTitle';
const searchResultMsg = '#search_form > div.c-outsideBlock__contents.mb-5 > span';
const searchResultList = '#page_admin_product table tbody';
const searchBtn = '#search_form .c-outsideBlock__contents button';
const noResultMsg = '.c-contentsArea .c-contentsArea__cols div.text-center.h5';

async function goProductList(page: import('@playwright/test').Page) {
  await page.goto(`/${adminRoute}/product`);
  await page.waitForLoadState('load');
}

async function searchProduct(page: import('@playwright/test').Page, keyword: string = '') {
  await page.locator('#admin_search_product_id').fill(keyword);
  await page.locator(searchBtn).click();
  await page.waitForLoadState('load');
}

test.describe('Admin Product (EA03)', () => {

  test('product_商品検索', async ({ page }) => {
    await goProductList(page);
    await searchProduct(page, 'ジェラート');
    await expect(page.locator(searchResultMsg)).toContainText('検索結果：1件が該当しました');
    await expect(page.locator(searchResultList)).toContainText('彩のジェラートCUBE');

    // 空検索 → 全件表示 (件数は固定値でなく正規表現で確認)
    await goProductList(page);
    await searchProduct(page, '');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);

    // 結果0件
    await goProductList(page);
    await searchProduct(page, 'gege@gege.com');
    await expect(page.locator(searchResultMsg)).toContainText('検索結果：0件が該当しました');
  });

  test('product_商品検索結果無', async ({ page }) => {
    await goProductList(page);
    await searchProduct(page, 'お箸');
    await expect(page.locator(noResultMsg)).toContainText('検索条件に合致するデータが見つかりませんでした');
  });

  test('product_規格確認のポップアップ表示', async ({ page }) => {
    await goProductList(page);
    await searchProduct(page, '');

    // 規格あり商品 (ex-product-1) の規格確認ボタンをクリック
    await page.locator('#ex-product-1 td:nth-child(7) button').click();
    await expect(page.locator('#productClassesModal')).toBeVisible({ timeout: 5_000 });

    // キャンセル
    await page.locator('#productClassesModal [data-bs-dismiss="modal"]:visible').last().click();
    await page.waitForTimeout(500);
    await expect(page.locator('#productClassesModal')).not.toBeVisible();
  });

  test('product_ポップアップから規格編集画面に遷移', async ({ page }) => {
    await goProductList(page);
    await searchProduct(page, '');

    // 規格確認ポップアップを開く
    await page.locator('#ex-product-1 td:nth-child(7) button').click();
    await expect(page.locator('#productClassesModal')).toBeVisible({ timeout: 5_000 });

    // 規格編集リンクをクリック
    await page.locator('#productClassesModal a[href*="class"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('商品規格登録');
  });

  test('product_CSV出力', async ({ page }) => {
    await goProductList(page);
    await searchProduct(page, '');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);

    // CSVダウンロード
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('a[href*="/product/export"]').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^product_\d{14}\.csv$/);
  });

  test('product_CSV出力項目設定', async ({ page }) => {
    await goProductList(page);

    // CSV出力項目設定リンクをクリック
    await page.locator('a[href*="/setting/shop/csv/1"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('CSV出力項目設定');
  });

  test('product_一覧でのソート', async ({ page }) => {
    await goProductList(page);
    await searchProduct(page, '');

    // ID昇順
    await page.locator('[data-sortkey="product_id"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.listSort-current[data-sortkey="product_id"] .fa-arrow-up')).toBeVisible();

    // ID降順
    await page.locator('[data-sortkey="product_id"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.listSort-current[data-sortkey="product_id"] .fa-arrow-down')).toBeVisible();

    // 更新日昇順
    await page.locator('[data-sortkey="update_date"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.listSort-current[data-sortkey="update_date"] .fa-arrow-up')).toBeVisible();

    // 更新日降順
    await page.locator('[data-sortkey="update_date"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.listSort-current[data-sortkey="update_date"] .fa-arrow-down')).toBeVisible();
  });

  test('product_商品登録非公開', async ({ page }) => {
    await page.goto(`/${adminRoute}/product/product/new`);
    await page.waitForLoadState('load');
    await page.locator('#admin_product_name').fill('test product1');
    await page.locator('#admin_product_class_price02').fill('1000');
    await page.locator('#admin_product_category_1').check();
    await page.locator('button.ladda-button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
  });

  test('product_商品登録公開', async ({ page }) => {
    await page.goto(`/${adminRoute}/product/product/new`);
    await page.waitForLoadState('load');
    await page.locator('#admin_product_name').fill('test product2');
    await page.locator('#admin_product_class_price02').fill('2000');
    await page.locator('#admin_product_Status').selectOption('公開');
    await page.locator('button.ladda-button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
  });

  test('product_商品の削除', async ({ page }) => {
    // 削除用商品を作成
    await page.goto(`/${adminRoute}/product/product/new`);
    await page.waitForLoadState('load');
    await page.locator('#admin_product_name').fill('削除用商品');
    await page.locator('#admin_product_class_price02').fill('1000');
    await page.locator('#admin_product_Status').selectOption('公開');
    await page.locator('button.ladda-button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');

    // 商品一覧で削除
    await goProductList(page);
    await searchProduct(page, '削除用商品');
    await expect(page.locator(searchResultMsg)).toContainText('検索結果：1件');
    await page.locator('#form_bulk table tbody tr:first-child input[type="checkbox"]').check();
    await page.locator('#form_bulk button.btn-ec-delete').click();
    await page.waitForTimeout(500);
    await page.locator('.modal.show .btn-ec-delete').click();
    await expect(page.locator('.modal.show .modal-body')).toContainText('商品の削除処理が完了しました', { timeout: 30_000 });

    await goProductList(page);
    await searchProduct(page, '削除用商品');
    await expect(page.locator(searchResultMsg)).toContainText('検索結果：0件');
  });

  test('product_商品の廃止', async ({ page }) => {
    await goProductList(page);
    await searchProduct(page, '');
    const productName = await page.locator('#form_bulk table tbody tr:first-child td:nth-child(4)').textContent();

    await page.locator('#form_bulk table tbody tr:first-child input[type="checkbox"]').check();
    await page.locator('#form_bulk button:has-text("廃止")').first().click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('廃止: 1件が正常に適用されました');
  });
});
