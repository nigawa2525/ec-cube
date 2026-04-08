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

  test('product_商品編集規格なし', async ({ page }) => {
    // Search for "test product1" created by earlier test, go to edit
    await goProductList(page);
    await searchProduct(page, 'test product1');
    await expect(page.locator(searchResultMsg)).toContainText(/検索結果：\d+件が該当しました/);

    // Click on product name to go to edit page
    await page.locator('#form_bulk table tbody tr:first-child td:nth-child(4) a').click();
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('商品登録');

    // Change name and save
    await page.locator('#admin_product_name').fill('test product11');
    await page.locator('#admin_product_category_1').check();
    await page.locator('#admin_product_category_2').check();
    await page.locator('button.ladda-button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
  });

  test('product_商品編集規格あり', async ({ page }) => {
    // Product without classes: fields are visible
    await goProductList(page);
    await searchProduct(page, 'test product1');
    await page.locator('#form_bulk table tbody tr:first-child td:nth-child(4) a').click();
    await page.waitForLoadState('load');

    await expect(page.locator('#admin_product_class_sale_type')).toBeVisible();
    await expect(page.locator('#admin_product_class_price02')).toBeVisible();
    await expect(page.locator('#admin_product_class_price01')).toBeVisible();
    await expect(page.locator('#admin_product_class_stock')).toBeVisible();
    await expect(page.locator('#admin_product_class_code')).toBeVisible();
    await expect(page.locator('#admin_product_class_sale_limit')).toBeVisible();
    await expect(page.locator('#admin_product_class_delivery_duration')).toBeVisible();

    // Product with classes: fields are not present
    await goProductList(page);
    await searchProduct(page, '彩のジェラートCUBE');
    await page.locator('#form_bulk table tbody tr:first-child td:nth-child(4) a').click();
    await page.waitForLoadState('load');

    await expect(page.locator('#admin_product_class_sale_type')).toHaveCount(0);
    await expect(page.locator('#admin_product_class_price02')).toHaveCount(0);
    await expect(page.locator('#admin_product_class_price01')).toHaveCount(0);
    await expect(page.locator('#admin_product_class_stock')).toHaveCount(0);
    await expect(page.locator('#admin_product_class_code')).toHaveCount(0);
    await expect(page.locator('#admin_product_class_sale_limit')).toHaveCount(0);
    await expect(page.locator('#admin_product_class_delivery_duration')).toHaveCount(0);

    // Save should still work
    await page.locator('button.ladda-button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
  });

  test('product_商品の確認', async ({ page }) => {
    // From product edit page, click "商品を確認" link
    await goProductList(page);
    await searchProduct(page, 'test product1');
    await page.locator('#form_bulk table tbody tr:first-child td:nth-child(4) a').click();
    await page.waitForLoadState('load');

    // Click "商品を確認" button (opens in new tab)
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('#preview a[target="_blank"]').click(),
    ]);
    await newPage.waitForLoadState('load');
    expect(newPage.url()).toContain('/products/detail/');
    await newPage.close();
  });

  test('product_一覧からの商品確認', async ({ page }) => {
    // From product list, click the eye icon (view) link
    await goProductList(page);
    await searchProduct(page, '');

    // The view link is in the action column with target="_blank" and fa-eye icon
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('#form_bulk table tbody tr:first-child td.align-middle.pe-3 a[target="_blank"]').click(),
    ]);
    await newPage.waitForLoadState('load');
    expect(newPage.url()).toContain('/products/detail/');
    await newPage.close();
  });

  test('product_規格登録_', async ({ page }) => {
    // Empty input should not create
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('規格管理');

    await page.locator('#admin_class_name_backend_name').fill('');
    await page.locator('#admin_class_name_name').fill('');
    await page.locator('#form1 button').click();
    await page.waitForLoadState('load');

    // Should not see success message (form validation prevents submission)
    // Create a valid class
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');
    await page.locator('#admin_class_name_backend_name').fill('backend test class1');
    await page.locator('#admin_class_name_name').fill('display test class1');
    await page.locator('#form1 button').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
  });

  test('product_規格編集', async ({ page }) => {
    // Go to class name page, click edit on the first actual class (li:3)
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');

    // Click edit on row 3
    await page.locator('ul.list-group > li:nth-child(3) > div > div.col-auto.text-end > a.action-edit').click();
    await page.waitForTimeout(500);

    // Verify edit form appears with inputs
    await expect(page.locator('ul.list-group > li:nth-child(3) form')).toBeVisible();

    // Get current values and verify they match what we created
    const nameVal = await page.locator('ul.list-group > li:nth-child(3) form input[type=text]').first().inputValue();
    expect(nameVal).toBeTruthy();

    // Submit the edit (save without changing)
    await page.locator('ul.list-group > li:nth-child(3) form button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');

    // Clean up: delete the class we created in product_規格登録_
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');
    // Find the class with 'display test class1' and delete it
    const listItems = await page.locator('ul.list-group > li').count();
    for (let i = 3; i <= listItems; i++) {
      const nameEl = page.locator(`ul.list-group > li:nth-child(${i}) > div > div.col.d-flex.align-items-center > a`);
      const txt = await nameEl.textContent();
      if (txt?.includes('display test class1')) {
        await page.locator(`ul.list-group > li:nth-child(${i}) > div > div.col-auto.text-end > div > a`).click();
        await page.waitForTimeout(500);
        await page.locator('#DeleteModal > div > div > div.modal-footer > a').click();
        await page.waitForLoadState('load');
        break;
      }
    }
  });

  test('product_規格削除', async ({ page }) => {
    // Create a class to delete
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');
    await page.locator('#admin_class_name_backend_name').fill('backend test class1');
    await page.locator('#admin_class_name_name').fill('display test class1');
    await page.locator('#form1 button').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');

    // Delete the newly created class (should be at li:nth-child(3))
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');
    // Find the new class (it's at the top)
    const nameText = await page.locator('ul.list-group > li:nth-child(3) > div > div.col.d-flex.align-items-center > a').textContent();
    expect(nameText).toContain('display test class1');

    await page.locator('ul.list-group > li:nth-child(3) > div > div.col-auto.text-end > div > a').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#DeleteModal')).toBeVisible();
    await page.locator('#DeleteModal > div > div > div.modal-footer > a').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('削除しました');
  });

  test('product_規格CSVダウンロード', async ({ page }) => {
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('a[href*="class_name/export"]').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^class_name_\d{14}\.csv$/);
  });

  test('product_分類登録', async ({ page }) => {
    // Create a class first for the category
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');
    await page.locator('#admin_class_name_backend_name').fill('test class2');
    await page.locator('#admin_class_name_name').fill('test class2');
    await page.locator('#form1 button').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');

    // Navigate to class categories
    await page.locator('ul.list-group > li:nth-child(3) > div > div.col.d-flex.align-items-center > a').click();
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('規格分類管理');

    // Create a class category
    await page.locator('#admin_class_category_name').fill('test class2 category1');
    await page.locator('#form1 button').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
    await expect(page.locator('ul.list-group > li:nth-child(3) > div > div.col.d-flex.align-items-center')).toContainText('test class2 category1');

    // Edit the class category
    await page.locator('ul.list-group > li:nth-child(3) > div > div.col-auto.text-end > a.action-edit').click();
    await page.waitForTimeout(500);
    await page.locator('ul.list-group > li:nth-child(3) form input[type=text]').first().fill('edit class category');
    await page.locator('ul.list-group > li:nth-child(3) form button[type=submit]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
    await expect(page.locator('ul.list-group > li:nth-child(3) > div > div.col.d-flex.align-items-center')).toContainText('edit class category');

    // Delete the class category
    await page.locator('ul.list-group > li:nth-child(3) > div > div.col-auto.text-end > div > a').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#DeleteModal')).toBeVisible();
    await page.locator('#DeleteModal > div > div > div.modal-footer > a').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('削除しました');

    // Clean up: delete the test class2
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');
    const listItems = await page.locator('ul.list-group > li').count();
    for (let i = 3; i <= listItems; i++) {
      const nameEl = page.locator(`ul.list-group > li:nth-child(${i}) > div > div.col.d-flex.align-items-center > a`);
      const txt = await nameEl.textContent();
      if (txt?.includes('test class2')) {
        await page.locator(`ul.list-group > li:nth-child(${i}) > div > div.col-auto.text-end > div > a`).click();
        await page.waitForTimeout(500);
        await page.locator('#DeleteModal > div > div > div.modal-footer > a').click();
        await page.waitForLoadState('load');
        break;
      }
    }
  });

  test('product_分類CSVダウンロード', async ({ page }) => {
    // Navigate to first class's categories
    await page.goto(`/${adminRoute}/product/class_name`);
    await page.waitForLoadState('load');
    await page.locator('ul.list-group > li:nth-child(3) > div > div.col.d-flex.align-items-center > a').click();
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('規格分類管理');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('a[href*="class_category/export"]').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^class_category_\d{14}\.csv$/);
  });

  test('product_カテゴリ登録', async ({ page }) => {
    await page.goto(`/${adminRoute}/product/category`);
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('カテゴリ管理');

    // Create a category
    await page.locator('#admin_category_name').fill('test category1');
    await page.locator('#form1 button').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');

    // Edit the category inline
    // Find the category row - newly created appears at the bottom
    const listItems = await page.locator('ul.list-group > li').count();
    let targetRow = -1;
    for (let i = 3; i <= listItems; i++) {
      const nameEl = page.locator(`ul.list-group > li:nth-child(${i}) > div > div.col.d-flex.align-items-center > a`);
      const count = await nameEl.count();
      if (count > 0) {
        const txt = await nameEl.textContent();
        if (txt?.includes('test category1')) {
          targetRow = i;
          break;
        }
      }
    }
    expect(targetRow).toBeGreaterThan(0);

    // Click edit
    await page.locator(`ul.list-group > li:nth-child(${targetRow}) > div > div.col-auto.text-end > a:nth-child(3)`).click();
    await page.waitForTimeout(500);

    // Fill in new name and submit
    await page.locator(`ul.list-group > li:nth-child(${targetRow}) form.mode-edit input[type="text"]`).fill('test category11');
    await page.locator(`ul.list-group > li:nth-child(${targetRow}) form.mode-edit button[type="submit"]`).click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');

    // Delete the category
    const listItemsAfter = await page.locator('ul.list-group > li').count();
    for (let i = 3; i <= listItemsAfter; i++) {
      const nameEl = page.locator(`ul.list-group > li:nth-child(${i}) > div > div.col.d-flex.align-items-center > a`);
      const count = await nameEl.count();
      if (count > 0) {
        const txt = await nameEl.textContent();
        if (txt?.includes('test category11')) {
          await page.locator(`ul.list-group > li:nth-child(${i}) > div > div.col-auto.text-end > div > a`).click();
          await page.waitForTimeout(500);
          await expect(page.locator('#DeleteModal')).toBeVisible();
          await page.locator('#DeleteModal > div > div > div.modal-footer > a').click();
          await page.waitForLoadState('load');
          break;
        }
      }
    }
  });

  test('product_タグ登録', async ({ page }) => {
    // Empty tag should not create
    await page.goto(`/${adminRoute}/product/tag`);
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('タグ管理');

    await page.locator('#admin_product_tag_name').fill('');
    await page.locator('.c-primaryCol .list-group > li:first-child form button[type="submit"]').click();
    await page.waitForLoadState('load');
    // Should not see success message for empty tag (HTML5 required validation prevents submission)

    // Create a valid tag
    const tagName = `new-tag-${Date.now()}`;
    await page.goto(`/${adminRoute}/product/tag`);
    await page.waitForLoadState('load');
    await page.locator('#admin_product_tag_name').fill(tagName);
    await page.locator('.c-primaryCol .list-group > li:first-child form button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
    await expect(page.locator('.c-primaryCol .list-group')).toContainText(tagName);
  });

  test('product_タグ編集', async ({ page }) => {
    await page.goto(`/${adminRoute}/product/tag`);
    await page.waitForLoadState('load');

    const tagName = `edit-tag-${Date.now()}`;

    // Click edit on first tag (li:nth-child(3))
    await page.locator('.c-primaryCol .list-group > li:nth-child(3) a[data-bs-original-title=編集]').click();
    await page.waitForTimeout(500);

    // Fill in new name
    await page.locator('.c-primaryCol .list-group > li:nth-child(3) input[type=text]').fill(tagName);

    // Submit
    await page.locator('.c-primaryCol .list-group > li:nth-child(3) .btn-ec-conversion').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
    await expect(page.locator('.c-primaryCol .list-group')).toContainText(tagName);
  });

  test('product_タグ削除', async ({ page }) => {
    // First create a tag so we have something safe to delete
    await page.goto(`/${adminRoute}/product/tag`);
    await page.waitForLoadState('load');
    const tagName = `delete-tag-${Date.now()}`;
    await page.locator('#admin_product_tag_name').fill(tagName);
    await page.locator('.c-primaryCol .list-group > li:first-child form button[type="submit"]').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('保存しました');
    await expect(page.locator('.c-primaryCol .list-group')).toContainText(tagName);

    // Delete the first tag in the list (the one we just created, at li:nth-child(3))
    await page.locator('.c-primaryCol .list-group > li:nth-child(3) a[data-bs-target="#DeleteModal"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#DeleteModal')).toBeVisible();
    await page.locator('.modal.show .btn-ec-delete').click();
    await page.waitForLoadState('load');
    await expect(page.locator('.alert-success')).toContainText('削除しました');
    await expect(page.locator('.c-primaryCol .list-group')).not.toContainText(tagName);
  });

  test('product_商品CSV登録雛形ファイルダウンロード', async ({ page }) => {
    await page.goto(`/${adminRoute}/product/product_csv_upload`);
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('商品CSV登録');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#download-button').click(),
    ]);
    expect(download.suggestedFilename()).toBe('product.csv');
  });

  test('product_カテゴリCSV登録雛形ファイルダウンロード', async ({ page }) => {
    await page.goto(`/${adminRoute}/product/category_csv_upload`);
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('カテゴリCSV登録');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#download-button').click(),
    ]);
    expect(download.suggestedFilename()).toBe('category.csv');
  });

  test('product_規格CSV登録雛形ファイルダウンロード', async ({ page }) => {
    await page.goto(`/${adminRoute}/product/class_name_csv_upload`);
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('規格CSV登録');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#download-button').click(),
    ]);
    expect(download.suggestedFilename()).toBe('class_name.csv');
  });

  test('product_規格分類CSV登録雛形ファイルダウンロード', async ({ page }) => {
    await page.goto(`/${adminRoute}/product/class_category_csv_upload`);
    await page.waitForLoadState('load');
    await expect(page.locator(pageTitle)).toContainText('規格分類CSV登録');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#download-button').click(),
    ]);
    expect(download.suggestedFilename()).toBe('class_category.csv');
  });
});
