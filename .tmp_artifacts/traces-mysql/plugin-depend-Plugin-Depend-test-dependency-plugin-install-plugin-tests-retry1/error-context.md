# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: plugin-depend.spec.ts >> Plugin Depend >> test_dependency_plugin_install
- Location: tests/plugin-depend.spec.ts:25:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#officialPluginDeleteModal').locator('.modal-body p')
Expected substring: "削除が完了しました。"
Received string:    "「エンペラー (1.0.0)」を削除中。この処理には数分かかる場合があります。画面をリロードせずにこのままお待ち下さい。"

Call log:
  - Expect "toContainText" with timeout 120000ms
  - waiting for locator('#officialPluginDeleteModal').locator('.modal-body p')
    14 × locator resolved to <p class="text-start">「エンペラー (1.0.0)」を削除中。この処理には数分かかる場合があります。画面をリロードせずに…</p>
       - unexpected value "「エンペラー (1.0.0)」を削除中。この処理には数分かかる場合があります。画面をリロードせずにこのままお待ち下さい。"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - heading [level=1] [ref=e5]:
        - img [ref=e6]
      - text: 
      - link "EC-CUBE SHOP" [ref=e7] [cursor=pointer]:
        - /url: http://127.0.0.1:8000/
        - text: EC-CUBE SHOP
        - generic [ref=e8]: 
      - generic [ref=e9] [cursor=pointer]:
        - generic [ref=e10]: 
        - text: 管理者 様
        - generic [ref=e11]: 
  - generic [ref=e12]:
    - navigation [ref=e14]:
      - list [ref=e15]:
        - listitem [ref=e16]:
          - link "ホーム" [ref=e17] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/admin/
            - generic [ref=e18]: 
            - text: ホーム
        - listitem [ref=e19]:
          - link "商品管理 " [ref=e20] [cursor=pointer]:
            - /url: "#nav-product"
            - generic [ref=e21]: 
            - text: 商品管理 
        - listitem [ref=e22]:
          - link "受注管理 " [ref=e23] [cursor=pointer]:
            - /url: "#nav-order"
            - generic [ref=e24]: 
            - text: 受注管理 
        - listitem [ref=e25]:
          - link "会員管理 " [ref=e26] [cursor=pointer]:
            - /url: "#nav-customer"
            - generic [ref=e27]: 
            - text: 会員管理 
        - listitem [ref=e28]:
          - link "コンテンツ管理 " [ref=e29] [cursor=pointer]:
            - /url: "#nav-content"
            - generic [ref=e30]: 
            - text: コンテンツ管理 
        - listitem [ref=e31]:
          - link "設定 " [ref=e32] [cursor=pointer]:
            - /url: "#nav-setting"
            - generic [ref=e33]: 
            - text: 設定 
          - text:  
        - listitem [ref=e34]:
          - link "オーナーズストア " [expanded] [ref=e35] [cursor=pointer]:
            - /url: "#nav-store"
            - generic [ref=e36]: 
            - text: オーナーズストア 
          - list [ref=e37]:
            - listitem [ref=e38]:
              - link "プラグイン " [ref=e39] [cursor=pointer]:
                - /url: "#nav-plugin"
              - list [ref=e40]:
                - listitem [ref=e41]:
                  - link "プラグインを探す" [ref=e42] [cursor=pointer]:
                    - /url: http://127.0.0.1:8000/admin/store/plugin/api/search
                - listitem [ref=e43]:
                  - link "プラグイン一覧" [ref=e44] [cursor=pointer]:
                    - /url: http://127.0.0.1:8000/admin/store/plugin
            - listitem [ref=e45]:
              - link "テンプレート " [expanded] [ref=e46] [cursor=pointer]:
                - /url: "#nav-template"
            - listitem [ref=e47]:
              - link "認証キー設定" [ref=e48] [cursor=pointer]:
                - /url: http://127.0.0.1:8000/admin/store/plugin/authentication_setting
        - listitem [ref=e49]:
          - link "情報 " [ref=e50] [cursor=pointer]:
            - /url: "#others"
            - generic [ref=e51]: 
            - text: 情報 
    - generic [ref=e52]:
      - generic [ref=e54]:
        - heading "インストールプラグイン一覧" [level=2] [ref=e55]
        - generic [ref=e56]: オーナーズストア
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]:
            - link "オーナーズストアから新規追加" [ref=e62] [cursor=pointer]:
              - /url: http://127.0.0.1:8000/admin/store/plugin/api/search
            - heading "オーナーズストアのプラグイン" [level=5] [ref=e63]
          - table [ref=e65]:
            - rowgroup [ref=e66]:
              - row "プラグイン名 バージョン コード ステータス アップデート" [ref=e67]:
                - columnheader "プラグイン名" [ref=e68]
                - columnheader "バージョン" [ref=e69]
                - columnheader "コード" [ref=e70]
                - columnheader "ステータス" [ref=e71]
                - columnheader "アップデート" [ref=e72]
                - columnheader [ref=e73]
            - rowgroup [ref=e74]:
              - row "エンペラー 1.0.0 Emperor 無効 アップデート対象プラグインはありません。 削除 有効化" [ref=e75]:
                - cell "エンペラー" [ref=e76]:
                  - generic [ref=e77]:
                    - link [ref=e78] [cursor=pointer]:
                      - /url: "#"
                    - generic [ref=e79]: エンペラー
                - cell "1.0.0" [ref=e80]
                - cell "Emperor" [ref=e81]:
                  - paragraph [ref=e82]: Emperor
                - cell "無効" [ref=e83]
                - cell "アップデート対象プラグインはありません。" [ref=e84]:
                  - paragraph [ref=e85]: アップデート対象プラグインはありません。
                - cell "削除 有効化" [ref=e86]:
                  - generic [ref=e87]:
                    - link "削除" [ref=e89] [cursor=pointer]:
                      - /url: "#"
                      - generic "削除" [ref=e90]: 
                    - link "有効化" [ref=e92] [cursor=pointer]:
                      - /url: http://127.0.0.1:8000/admin/store/plugin/4/enable
                      - generic "有効化" [ref=e94]: 
              - row "ホライゾン 1.0.0 Horizon 無効 アップデート対象プラグインはありません。 削除 有効化" [ref=e96]:
                - cell "ホライゾン" [ref=e97]:
                  - generic [ref=e98]:
                    - link [ref=e99] [cursor=pointer]:
                      - /url: "#"
                    - generic [ref=e100]: ホライゾン
                - cell "1.0.0" [ref=e101]
                - cell "Horizon" [ref=e102]:
                  - paragraph [ref=e103]: Horizon
                - cell "無効" [ref=e104]
                - cell "アップデート対象プラグインはありません。" [ref=e105]:
                  - paragraph [ref=e106]: アップデート対象プラグインはありません。
                - cell "削除 有効化" [ref=e107]:
                  - generic [ref=e108]:
                    - link "削除" [ref=e110] [cursor=pointer]:
                      - /url: "#"
                      - generic "削除" [ref=e111]: 
                    - link "有効化" [ref=e113] [cursor=pointer]:
                      - /url: http://127.0.0.1:8000/admin/store/plugin/3/enable
                      - generic "有効化" [ref=e115]: 
          - dialog "プラグインの削除を確認する 「エンペラー (1.0.0)」を削除中。この処理には数分かかる場合があります。画面をリロードせずにこのままお待ち下さい。 50" [ref=e117]:
            - document:
              - generic [ref=e118]:
                - heading "プラグインの削除を確認する" [level=5] [ref=e120]
                - generic [ref=e121]:
                  - paragraph [ref=e122]: 「エンペラー (1.0.0)」を削除中。この処理には数分かかる場合があります。画面をリロードせずにこのままお待ち下さい。
                  - progressbar [ref=e124]
                  - text: 
        - generic [ref=e125]:
          - generic [ref=e126]:
            - link "アップロードして新規追加" [ref=e127] [cursor=pointer]:
              - /url: http://127.0.0.1:8000/admin/store/plugin/install
            - heading "ユーザー独自プラグイン" [level=5] [ref=e128]
          - generic [ref=e130]: インストールされているプラグインはありません。
```

# Test source

```ts
  1   | import { type Page, type Locator, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * プラグイン管理ページ (インストールプラグイン一覧)
  5   |  * Codeception の PluginManagePage に相当
  6   |  */
  7   | export class PluginManagePage {
  8   |   /** フラッシュメッセージ (成功/エラー) のセレクタ
  9   |    * 複数のアラートが表示される場合があるため、.first() と合わせて使用 */
  10  |   static readonly ALERT_SELECTOR = '#page_admin_store_plugin > div.c-container > div.c-contentsArea > div.alert:not(.alert-primary).alert-dismissible span';
  11  | 
  12  |   constructor(private readonly page: Page) {}
  13  | 
  14  |   static async at(page: Page): Promise<PluginManagePage> {
  15  |     await expect(page.locator('.c-pageTitle')).toContainText('インストールプラグイン一覧', { timeout: 30_000 });
  16  |     return new PluginManagePage(page);
  17  |   }
  18  | 
  19  |   // ============================================================
  20  |   // ストアプラグイン (オーナーズストアのプラグイン)
  21  |   // ============================================================
  22  | 
  23  |   private storePluginSection(): Locator {
  24  |     return this.page.locator('.card').filter({
  25  |       has: this.page.locator('h5.box-title', { hasText: 'オーナーズストアのプラグイン' }),
  26  |     });
  27  |   }
  28  | 
  29  |   private storePluginRow(code: string): Locator {
  30  |     return this.storePluginSection()
  31  |       .getByRole('row')
  32  |       .filter({ has: this.page.locator('td p', { hasText: code }) });
  33  |   }
  34  | 
  35  |   async ストアプラグイン_有効化(code: string, expectedMessage = '有効にしました。'): Promise<this> {
  36  |     await this.dismissAlerts();
  37  |     const row = this.storePluginRow(code);
  38  |     // fa-play = 有効化アイコン (Bootstrap tooltip が title を data-bs-original-title に移動するため CSS クラスで特定)
  39  |     await row.locator('i.fa-play').locator('..').click();
  40  |     await this.page.waitForLoadState('load');
  41  |     await expect(this.page.locator(PluginManagePage.ALERT_SELECTOR).first()).toContainText(expectedMessage, { timeout: 30_000 });
  42  |     return this;
  43  |   }
  44  | 
  45  |   async ストアプラグイン_無効化(code: string, expectedMessage = '無効にしました。'): Promise<this> {
  46  |     await this.dismissAlerts();
  47  |     const row = this.storePluginRow(code);
  48  |     // fa-pause = 無効化アイコン
  49  |     await row.locator('i.fa-pause').locator('..').click();
  50  |     await this.page.waitForLoadState('load');
  51  |     await expect(this.page.locator(PluginManagePage.ALERT_SELECTOR).first()).toContainText(expectedMessage, { timeout: 30_000 });
  52  |     return this;
  53  |   }
  54  | 
  55  |   async ストアプラグイン_削除(code: string, expectedMessage = '削除が完了しました。'): Promise<this> {
  56  |     await this.dismissAlerts();
  57  |     const row = this.storePluginRow(code);
  58  |     // fa-close = 削除アイコン
  59  |     await row.locator('i.fa-close').locator('..').click();
  60  | 
  61  |     const modal = this.page.locator('#officialPluginDeleteModal');
  62  |     await expect(modal.locator('#officialPluginDeleteButton')).toBeVisible({ timeout: 10_000 });
  63  |     await modal.locator('#officialPluginDeleteButton').click();
  64  | 
  65  |     // 削除処理完了待ち (AJAX / composer uninstall が遅い場合がある)
> 66  |     await expect(modal.locator('.modal-body p')).toContainText(expectedMessage, { timeout: 120_000 });
      |                                                  ^ Error: expect(locator).toContainText(expected) failed
  67  |     // 「完了」ボタン (3番目のボタン) をクリック
  68  |     await modal.locator('.modal-footer button:nth-child(3)').click();
  69  |     return this;
  70  |   }
  71  | 
  72  |   async ストアプラグイン_アップデート(code: string): Promise<PluginStoreConfirmPage> {
  73  |     const row = this.storePluginRow(code);
  74  |     await row.locator('a.btn-ec-regular').click();
  75  |     return PluginStoreConfirmPage.at(this.page);
  76  |   }
  77  | 
  78  |   // ============================================================
  79  |   // 独自プラグイン (ユーザー独自プラグイン)
  80  |   // ============================================================
  81  | 
  82  |   private localPluginSection(): Locator {
  83  |     return this.page.locator('.card').filter({
  84  |       has: this.page.locator('h5.box-title', { hasText: 'ユーザー独自プラグイン' }),
  85  |     });
  86  |   }
  87  | 
  88  |   private localPluginRow(code: string): Locator {
  89  |     return this.localPluginSection()
  90  |       .getByRole('row')
  91  |       .filter({ hasText: code });
  92  |   }
  93  | 
  94  |   async 独自プラグイン_有効化(code: string): Promise<this> {
  95  |     await this.dismissAlerts();
  96  |     const row = this.localPluginRow(code);
  97  |     await row.locator('i.fa-play').locator('..').click();
  98  |     await this.page.waitForLoadState('load');
  99  |     await expect(this.page.locator(PluginManagePage.ALERT_SELECTOR).first()).toContainText('有効にしました。', { timeout: 30_000 });
  100 |     return this;
  101 |   }
  102 | 
  103 |   async 独自プラグイン_無効化(code: string): Promise<this> {
  104 |     await this.dismissAlerts();
  105 |     const row = this.localPluginRow(code);
  106 |     await row.locator('i.fa-pause').locator('..').click();
  107 |     await this.page.waitForLoadState('load');
  108 |     await expect(this.page.locator(PluginManagePage.ALERT_SELECTOR).first()).toContainText('無効にしました。', { timeout: 30_000 });
  109 |     return this;
  110 |   }
  111 | 
  112 |   async 独自プラグイン_削除(code: string): Promise<this> {
  113 |     await this.dismissAlerts();
  114 |     const row = this.localPluginRow(code);
  115 |     await row.locator('i.fa-close').locator('..').click();
  116 | 
  117 |     const modal = this.page.locator('#localPluginDeleteModal');
  118 |     await expect(modal.locator('.modal-footer a')).toBeVisible({ timeout: 10_000 });
  119 |     await modal.locator('.modal-footer a').click();
  120 |     await this.page.waitForLoadState('load');
  121 |     return this;
  122 |   }
  123 | 
  124 |   async 独自プラグイン_アップデート(code: string, tgzPath: string): Promise<this> {
  125 |     const row = this.localPluginRow(code);
  126 |     // ファイル選択
  127 |     const fileInput = row.locator('input[type="file"]');
  128 |     await fileInput.setInputFiles(tgzPath);
  129 |     // アップデートボタンクリック
  130 |     await row.locator('button.btn-primary').click();
  131 |     await this.page.waitForLoadState('load');
  132 |     await expect(this.page.locator(PluginManagePage.ALERT_SELECTOR)).toContainText('アップデートしました。', { timeout: 30_000 });
  133 |     return this;
  134 |   }
  135 | 
  136 |   // ============================================================
  137 |   // ヘルパー
  138 |   // ============================================================
  139 | 
  140 |   private async dismissAlerts(): Promise<void> {
  141 |     // 既存のフラッシュメッセージを閉じる (クリックを遮らないように)
  142 |     const closeButtons = this.page.locator('.alert-dismissible .btn-close');
  143 |     const count = await closeButtons.count();
  144 |     for (let i = 0; i < count; i++) {
  145 |       await closeButtons.nth(i).click().catch(() => {});
  146 |     }
  147 |     // tooltip も除去
  148 |     await this.page.evaluate(() => {
  149 |       document.querySelectorAll('.tooltip').forEach(e => e.remove());
  150 |     });
  151 |   }
  152 | }
  153 | 
  154 | /**
  155 |  * プラグインストアインストール確認 / アップデート確認ページ
  156 |  * Codeception の PluginStoreInstallPage / PluginStoreUpgradePage を統合
  157 |  */
  158 | export class PluginStoreConfirmPage {
  159 |   constructor(private readonly page: Page) {}
  160 | 
  161 |   static async at(page: Page): Promise<PluginStoreConfirmPage> {
  162 |     await expect(page.locator('.c-pageTitle')).toContainText('オーナーズストア', { timeout: 30_000 });
  163 |     return new PluginStoreConfirmPage(page);
  164 |   }
  165 | 
  166 |   async インストール(expectedMessage = 'インストールが完了しました。'): Promise<PluginManagePage> {
```