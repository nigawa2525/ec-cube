import { test, expect } from '@playwright/test';

test.describe('Front Customer Registration (EF04)', () => {

  test('EF0401-UC01-T01 会員登録 入力確認画面表示', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('load');

    const email = `test_${Date.now()}@example.com`;

    // 会員情報入力フォームに情報を入力
    await page.locator('#entry_name_name01').fill('姓');
    await page.locator('#entry_name_name02').fill('名');
    await page.locator('#entry_kana_kana01').fill('セイ');
    await page.locator('#entry_kana_kana02').fill('メイ');
    await page.locator('#entry_postal_code').fill('530-0001');
    await page.locator('#entry_address_pref').selectOption({ value: '27' });
    await page.waitForTimeout(1000); // 郵便番号の自動入力を待つ
    await page.locator('#entry_address_addr01').fill('大阪市北区');
    await page.locator('#entry_address_addr02').fill('梅田2-4-9 ブリーゼタワー13F');
    await page.locator('#entry_phone_number').fill('111-111-111');
    await page.locator('#entry_email_first').fill(email);
    await page.locator('#entry_email_second').fill(email);
    await page.locator('#entry_plain_password_first').fill('password1234');
    await page.locator('#entry_plain_password_second').fill('password1234');
    await page.locator('#entry_job').selectOption({ value: '1' });
    await page.locator('#entry_user_policy_check').check();

    // 「同意する」ボタンを押下
    await page.locator('button.ec-blockBtn--action[type="submit"]').click();
    await page.waitForLoadState('load');

    // 確認画面に遷移
    await expect(page.locator('.ec-registerRole')).toBeVisible();

    // 入力した情報が表示される
    await expect(page.locator('.ec-registerRole')).toContainText('姓');
    await expect(page.locator('.ec-registerRole')).toContainText('名');
    await expect(page.locator('.ec-registerRole')).toContainText('111111111');
    await expect(page.locator('.ec-registerRole')).toContainText(email);
  });

  test('EF0401-UC01-T03 会員登録 異常パターン 入力ミス', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('load');

    const email = `test_${Date.now()}@example.com`;

    // 姓を空にして入力（異常パターン）
    await page.locator('#entry_name_name01').fill('');
    await page.locator('#entry_name_name02').fill('名');
    await page.locator('#entry_kana_kana01').fill('セイ');
    await page.locator('#entry_kana_kana02').fill('メイ');
    await page.locator('#entry_postal_code').fill('530-0001');
    await page.locator('#entry_address_pref').selectOption({ value: '27' });
    await page.waitForTimeout(1000);
    await page.locator('#entry_address_addr01').fill('大阪市北区');
    await page.locator('#entry_address_addr02').fill('梅田2-4-9 ブリーゼタワー13F');
    await page.locator('#entry_phone_number').fill('111-111-111');
    await page.locator('#entry_email_first').fill(email);
    await page.locator('#entry_email_second').fill(email);
    await page.locator('#entry_plain_password_first').fill('password1234');
    await page.locator('#entry_plain_password_second').fill('password1234');

    // 「同意する」ボタンを押下
    await page.locator('button.ec-blockBtn--action[type="submit"]').click();
    await page.waitForLoadState('load');

    // 会員登録画面のままでエラーが表示される
    await expect(page.locator('.ec-pageHeader h1')).toContainText('新規会員登録');
  });

  test('EF0401-UC01-T04 会員登録 同意しないボタン', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('load');

    // 「同意しない」ボタンを押下
    await page.locator('a.ec-blockBtn--cancel').click();
    await page.waitForLoadState('load');

    // トップページに戻る
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.ec-newsRole')).toBeVisible();
  });

  test('EF0401-UC01-T05 会員登録 戻るボタン', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('load');

    const email = `test_${Date.now()}@example.com`;

    // 会員情報入力
    await page.locator('#entry_name_name01').fill('姓');
    await page.locator('#entry_name_name02').fill('名');
    await page.locator('#entry_kana_kana01').fill('セイ');
    await page.locator('#entry_kana_kana02').fill('メイ');
    await page.locator('#entry_postal_code').fill('530-0001');
    await page.locator('#entry_address_pref').selectOption({ value: '27' });
    await page.waitForTimeout(1000);
    await page.locator('#entry_address_addr01').fill('大阪市北区');
    await page.locator('#entry_address_addr02').fill('梅田2-4-9 ブリーゼタワー13F');
    await page.locator('#entry_phone_number').fill('111-111-111');
    await page.locator('#entry_email_first').fill(email);
    await page.locator('#entry_email_second').fill(email);
    await page.locator('#entry_plain_password_first').fill('password1234');
    await page.locator('#entry_plain_password_second').fill('password1234');
    await page.locator('#entry_job').selectOption({ value: '1' });
    await page.locator('#entry_user_policy_check').check();

    // 「同意する」ボタンで確認画面へ
    await page.locator('button.ec-blockBtn--action[type="submit"]').click();
    await page.waitForLoadState('load');

    // 確認画面が表示される
    await expect(page.locator('.ec-registerRole')).toBeVisible();

    // 「戻る」ボタンを押下
    await page.locator('.ec-registerRole form button.ec-blockBtn--cancel').click();
    await page.waitForLoadState('load');

    // 入力画面に戻る
    await expect(page.locator('.ec-pageHeader h1')).toContainText('新規会員登録');
  });

  test('EF0404-UC01-T01 会員登録 利用規約リンク', async ({ page }) => {
    await page.goto('/entry');
    await page.waitForLoadState('load');

    // 利用規約リンクをクリック
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('.ec-registerRole form a.ec-link').click(),
    ]);

    await newPage.waitForLoadState();

    // 利用規約ページに遷移
    expect(newPage.url()).toContain('/help/agreement');
    await newPage.close();
  });
});
