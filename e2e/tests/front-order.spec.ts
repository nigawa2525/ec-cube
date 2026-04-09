import { test, expect } from '@playwright/test';

/**
 * Helper: Add a product to cart and go to the cart page.
 * Uses Product ID 2 (チェリーアイスサンド) which has no class categories.
 */
async function addProductToCartAndGoToCart(page: import('@playwright/test').Page, quantity = 1) {
  await page.goto('/products/detail/2');
  await page.waitForLoadState('load');
  await page.locator('#quantity').fill(String(quantity));
  await page.locator('.add-cart').click();
  await expect(page.locator('div.ec-modal-box')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#ec-modal-header')).toContainText('カートに追加しました');
  await page.locator('div.ec-modal-box > div > a').click();
  await page.waitForLoadState('load');
  await expect(page.locator('div.ec-pageHeader h1')).toContainText('ショッピングカート');
}

/**
 * Helper: Login as the test customer via /mypage/login.
 */
async function loginAsTestCustomer(page: import('@playwright/test').Page) {
  await page.goto('/mypage/login');
  await page.waitForLoadState('load');
  await page.locator('input[name="login_email"]').fill('playwright@test.test');
  await page.locator('input[name="login_pass"]').fill('password');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForLoadState('load');
}

/**
 * Helper: Clean up cart by deleting all items.
 */
async function clearCart(page: import('@playwright/test').Page) {
  await page.goto('/cart');
  await page.waitForLoadState('load');
  page.on('dialog', dialog => dialog.accept());
  const deleteLinks = page.locator('.ec-cartRow__delColumn a');
  while (await deleteLinks.count() > 0) {
    await deleteLinks.first().click();
    await page.waitForLoadState('load');
  }
}

test.describe('Front Order (EF03)', () => {

  test.afterEach(async ({ page }) => {
    // Clean up cart after each test to avoid interference
    await clearCart(page);
  });

  test('EF0301-UC01-T01 カート 買い物を続ける', async ({ page }) => {
    // ログインしてカートに商品追加
    await loginAsTestCustomer(page);
    await addProductToCartAndGoToCart(page, 1);

    // 「お買い物を続ける」ボタンをクリック
    await page.locator('a.ec-blockBtn--cancel', { hasText: 'お買い物を続ける' }).click();
    await page.waitForLoadState('load');

    // トップページに遷移する
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.ec-newsRole')).toBeVisible();
  });

  test('EF0302-UC01-T01 ログインユーザ購入', async ({ page }) => {
    // ログアウト状態から開始
    await page.goto('/logout');
    await page.waitForLoadState('load');

    // カートに商品追加
    await addProductToCartAndGoToCart(page, 1);

    // レジに進む
    await page.locator('a.ec-blockBtn--action', { hasText: 'レジに進む' }).click();
    await page.waitForLoadState('load');

    // ショッピングログインページでログイン
    await expect(page).toHaveURL(/\/shopping\/login/);
    await page.locator('input[name="login_email"]').fill('playwright@test.test');
    await page.locator('input[name="login_pass"]').fill('password');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('load');

    // ご注文手続きページ
    await expect(page).toHaveURL(/\/shopping$/);

    // 確認する
    await page.locator('.ec-blockBtn--action', { hasText: '確認する' }).click();
    await page.waitForLoadState('load');

    // ご注文確認ページ
    await expect(page).toHaveURL(/\/shopping\/confirm/);
    await expect(page.locator('.ec-pageHeader h1')).toContainText('ご注文内容のご確認');

    // 注文する
    await page.locator('.ec-blockBtn--action', { hasText: '注文する' }).click();
    await page.waitForLoadState('load');

    // 注文完了ページ
    await expect(page).toHaveURL(/\/shopping\/complete/);
    await expect(page.locator('.ec-pageHeader h1')).toContainText('ご注文完了');

    // トップページへ戻る
    await page.locator('a.ec-blockBtn--cancel', { hasText: 'トップページへ' }).click();
    await page.waitForLoadState('load');
    await expect(page.locator('.ec-newsRole')).toBeVisible();
  });

  test('EF0302-UC02-T01 ゲスト購入', async ({ page }) => {
    // ログアウト状態から開始
    await page.goto('/logout');
    await page.waitForLoadState('load');

    // カートに商品追加
    await addProductToCartAndGoToCart(page, 1);

    // レジに進む
    await page.locator('a.ec-blockBtn--action', { hasText: 'レジに進む' }).click();
    await page.waitForLoadState('load');

    // ゲスト購入リンクをクリック
    await expect(page).toHaveURL(/\/shopping\/login/);
    await page.getByRole('link', { name: 'ゲスト購入' }).click();
    await page.waitForLoadState('load');

    // お客様情報入力ページ
    await expect(page).toHaveURL(/\/shopping\/nonmember/);
    await expect(page.locator('.ec-pageHeader h1')).toContainText('お客様情報の入力');

    const guestEmail = `guest_${Date.now()}@test.test`;

    // お客様情報を入力
    await page.locator('#nonmember_name_name01').fill('テスト');
    await page.locator('#nonmember_name_name02').fill('太郎');
    await page.locator('#nonmember_kana_kana01').fill('テスト');
    await page.locator('#nonmember_kana_kana02').fill('タロウ');
    await page.locator('#nonmember_postal_code').fill('530-0001');
    await page.waitForTimeout(2000); // 郵便番号の自動入力を待つ
    await page.locator('#nonmember_address_pref').selectOption({ value: '27' });
    await page.locator('#nonmember_address_addr01').fill('大阪市北区');
    await page.locator('#nonmember_address_addr02').fill('梅田2-4-9 ブリーゼタワー13F');
    await page.locator('#nonmember_phone_number').fill('111-111-111');
    await page.locator('#nonmember_email_first').fill(guestEmail);
    await page.locator('#nonmember_email_second').fill(guestEmail);

    // 次へ
    await page.locator('button.ec-blockBtn--action', { hasText: '次へ' }).click();
    await page.waitForLoadState('load');

    // ご注文手続きページ
    await expect(page).toHaveURL(/\/shopping$/);

    // 確認する
    await page.locator('.ec-blockBtn--action', { hasText: '確認する' }).click();
    await page.waitForLoadState('load');

    // ご注文確認ページ
    await expect(page).toHaveURL(/\/shopping\/confirm/);
    await expect(page.locator('.ec-pageHeader h1')).toContainText('ご注文内容のご確認');

    // 注文する
    await page.locator('.ec-blockBtn--action', { hasText: '注文する' }).click();
    await page.waitForLoadState('load');

    // 注文完了ページ
    await expect(page).toHaveURL(/\/shopping\/complete/);
    await expect(page.locator('.ec-pageHeader h1')).toContainText('ご注文完了');

    // トップページへ戻る
    await page.locator('a.ec-blockBtn--cancel', { hasText: 'トップページへ' }).click();
    await page.waitForLoadState('load');
    await expect(page.locator('.ec-newsRole')).toBeVisible();
  });

  test('EF0305-UC01-T01 購入確認画面からカートに戻る', async ({ page }) => {
    // ログインしてカートに商品追加
    await loginAsTestCustomer(page);
    await addProductToCartAndGoToCart(page, 1);

    // レジに進む
    await page.locator('a.ec-blockBtn--action', { hasText: 'レジに進む' }).click();
    await page.waitForLoadState('load');

    // ご注文手続きページ
    await expect(page).toHaveURL(/\/shopping$/);

    // 確認する
    await page.locator('.ec-blockBtn--action', { hasText: '確認する' }).click();
    await page.waitForLoadState('load');

    // ご注文確認ページ
    await expect(page).toHaveURL(/\/shopping\/confirm/);

    // 「ご注文手続きに戻る」をクリック
    await page.getByRole('link', { name: 'ご注文手続きに戻る' }).click();
    await page.waitForLoadState('load');

    // ご注文手続きページに戻る
    await expect(page).toHaveURL(/\/shopping$/);

    // さらに「カートに戻る」をクリック
    await page.locator('a.ec-blockBtn--cancel', { hasText: 'カートに戻る' }).click();
    await page.waitForLoadState('load');

    // カートページに戻る
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator('div.ec-pageHeader h1')).toContainText('ショッピングカート');

    // カートに商品が残っていることを確認
    await expect(page.locator('.ec-cartRow__name').first()).toContainText('チェリーアイスサンド');
  });
});
