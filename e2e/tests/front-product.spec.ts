import { test, expect } from '@playwright/test';

test.describe('Front Product (EF02)', () => {

  test('EF0201-UC01-T01 商品一覧ページ 初期表示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // ヘッダーナビからカテゴリ「新入荷」を選択
    await page.locator('.ec-itemNav__nav li a', { hasText: '新入荷' }).first().click();
    await page.waitForLoadState('load');

    // 商品一覧ページに遷移する
    await expect(page).toHaveURL(/products\/list\?category_id=/);

    // パンくずにカテゴリ名が表示される
    await expect(page.locator('.ec-topicpath')).toContainText('新入荷');

    // 商品がサムネイル表示される
    await expect(page.locator('.ec-shelfGrid')).toBeVisible();
    const items = page.locator('.ec-shelfGrid__item');
    await expect(items.first()).toBeVisible();
  });

  test('EF0201-UC03-T01 商品一覧ページ ソート', async ({ page }) => {
    // 全件検索で商品一覧を表示
    await page.goto('/products/list');
    await page.waitForLoadState('load');
    await expect(page.locator('.ec-shelfGrid__item').first()).toBeVisible();

    // デフォルトは「価格が低い順」
    const orderbySelect = page.locator('select[name="orderby"]');
    await expect(orderbySelect.locator('option[selected]')).toHaveText('価格が低い順');

    // ソート条件を「価格が高い順」に変更
    await orderbySelect.selectOption('価格が高い順');
    await page.waitForLoadState('load');

    // ソート条件が変更されている
    await expect(page.locator('select[name="orderby"] option[selected]')).toHaveText('価格が高い順');

    // 「新着順」に変更
    await page.locator('select[name="orderby"]').selectOption('新着順');
    await page.waitForLoadState('load');
    await expect(page.locator('select[name="orderby"] option[selected]')).toHaveText('新着順');
  });

  test('EF0201-UC04-T01 商品一覧ページ 表示件数', async ({ page }) => {
    // 全件検索で商品一覧を表示
    await page.goto('/products/list');
    await page.waitForLoadState('load');
    await expect(page.locator('.ec-shelfGrid__item').first()).toBeVisible();

    // デフォルトは20件
    const dispSelect = page.locator('select[name="disp_number"]');
    await expect(dispSelect.locator('option[selected]')).toHaveText('20件');

    // 表示件数を40件に変更
    await dispSelect.selectOption('40件');
    await page.waitForLoadState('load');
    await expect(page.locator('select[name="disp_number"] option[selected]')).toHaveText('40件');

    // 表示件数を60件に変更
    await page.locator('select[name="disp_number"]').selectOption('60件');
    await page.waitForLoadState('load');
    await expect(page.locator('select[name="disp_number"] option[selected]')).toHaveText('60件');
  });

  test('EF0202-UC01-T02 商品詳細 カテゴリリンク', async ({ page }) => {
    // 商品詳細ページへ遷移 (product 1)
    await page.goto('/products/detail/1');
    await page.waitForLoadState('load');

    // 商品名が表示される
    await expect(page.locator('.ec-headingTitle')).toContainText('彩のジェラートCUBE');

    // ヘッダーナビからカテゴリを選択
    const navItem = page.locator('.ec-itemNav__nav li a', { hasText: '新入荷' }).first();
    await navItem.click();
    await page.waitForLoadState('load');

    // 商品一覧ページに遷移する
    await expect(page).toHaveURL(/products\/list\?category_id=/);
    await expect(page.locator('.ec-topicpath')).toContainText('新入荷');
    await expect(page.locator('.ec-shelfGrid')).toBeVisible();
  });

  test('EF0202-UC01-T03 商品詳細 サムネイル', async ({ page }) => {
    await page.goto('/products/detail/1');
    await page.waitForLoadState('load');

    // サムネイル画像が表示される
    const thumbContainer = page.locator('.item_nav');
    await expect(thumbContainer).toBeVisible();

    // 最初のサムネイル画像のsrcを確認
    const firstThumb = thumbContainer.locator('div:nth-child(1) img');
    const src = await firstThumb.getAttribute('src');
    expect(src).toMatch(/\/upload\/save_image\/.+\.png$/);
  });

  test('EF0202-UC02-T04 商品詳細(規格あり) カートに追加', async ({ page }) => {
    await page.goto('/products/detail/1');
    await page.waitForLoadState('load');

    // 規格1を選択（チョコ）
    await page.locator('#classcategory_id1').selectOption('チョコ');
    await page.waitForTimeout(500);

    // 規格2が表示されたら選択
    const select2 = page.locator('#classcategory_id2');
    if (await select2.isVisible()) {
      // 最初の実際のオプションを選択（「選択してください」以外）
      const options = select2.locator('option');
      const count = await options.count();
      for (let i = 0; i < count; i++) {
        const text = await options.nth(i).textContent();
        if (text && !text.includes('選択してください')) {
          await select2.selectOption({ index: i });
          break;
        }
      }
      await page.waitForTimeout(500);
    }

    // 数量を設定
    await page.locator('#quantity').fill('1');

    // カートに入れるボタンをクリック
    await page.locator('.add-cart').click();

    // モーダルが表示される
    await expect(page.locator('div.ec-modal-box')).toBeVisible({ timeout: 10_000 });

    // カートに追加されたメッセージを確認
    await expect(page.locator('#ec-modal-header')).toContainText('カートに追加しました');

    // カートへ進む
    await page.locator('div.ec-modal-box > div > a').click();
    await page.waitForLoadState('load');

    // カートページに遷移
    await expect(page.locator('div.ec-pageHeader h1')).toContainText('ショッピングカート');

    // 商品名が表示される
    const cartItemName = page.locator('.ec-cartRow__name').first();
    await expect(cartItemName).toContainText('彩のジェラートCUBE');

    // 数量が表示される
    const cartItemAmount = page.locator('.ec-cartRow__amount').first();
    await expect(cartItemAmount).toContainText('1');

    // カートから削除
    page.on('dialog', dialog => dialog.accept());
    await page.locator('.ec-cartRow__delColumn a').first().click();
    await page.waitForLoadState('load');
  });

  test('EF0202-UC02-T01 商品詳細 カート追加と削除', async ({ page }) => {
    await page.goto('/products/detail/1');
    await page.waitForLoadState('load');

    // 規格を選択
    await page.locator('#classcategory_id1').selectOption('チョコ');
    await page.waitForTimeout(500);

    const select2 = page.locator('#classcategory_id2');
    if (await select2.isVisible()) {
      const options = select2.locator('option');
      const count = await options.count();
      for (let i = 0; i < count; i++) {
        const text = await options.nth(i).textContent();
        if (text && !text.includes('選択してください')) {
          await select2.selectOption({ index: i });
          break;
        }
      }
      await page.waitForTimeout(500);
    }

    // 数量を2に設定
    await page.locator('#quantity').fill('2');
    await page.locator('.add-cart').click();

    // モーダルが表示される
    await expect(page.locator('div.ec-modal-box')).toBeVisible({ timeout: 10_000 });

    // カートへ進む
    await page.locator('div.ec-modal-box > div > a').click();
    await page.waitForLoadState('load');

    // カートページで数量2が表示される
    await expect(page.locator('.ec-cartRow__amount').first()).toContainText('2');

    // 商品を削除
    page.on('dialog', dialog => dialog.accept());
    await page.locator('.ec-cartRow__delColumn a').first().click();
    await page.waitForLoadState('load');

    // カートが空になっている（商品行が消える）
    await expect(page.locator('.ec-cartRow__name')).toHaveCount(0);
  });
});
