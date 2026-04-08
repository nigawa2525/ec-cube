# プラグインテスト flaky test 調査メモ

## ブランチ

`fix/plugin-test-flaky-waitfortext` (ベース: `4.3`)

## CI ラン履歴

| Run | 結果 | 備考 |
|-----|------|------|
| [#22138996632](https://github.com/EC-CUBE/ec-cube/actions/runs/22138996632) | FAIL | 初回。リトライで `plugin already installed` エラー |
| [#22140430792](https://github.com/EC-CUBE/ec-cube/actions/runs/22140430792) | FAIL | リトライ削除後。info alert との CSS セレクタ競合が原因（全 `_local` 失敗） |
| [#22156965715](https://github.com/EC-CUBE/ec-cube/actions/runs/22156965715) | FAIL(1件) | `.alert-success` 追加で `_local` は全パス。`test_dependency_plugin_install`(mysql) のみ失敗: 依存関係エラーが `alert-danger` で表示されるが `.alert-success` 限定セレクタで検出不可 |
| [#22157274080](https://github.com/EC-CUBE/ec-cube/actions/runs/22157274080) | FAIL(3件) | `:not(.alert-primary)` でセレクタ修正。`独自プラグイン_無効化` (Step 42) でフレーキーにタイムアウト。click→waitForText 間にページ遷移待機がない |
| [#22158334822](https://github.com/EC-CUBE/ec-cube/actions/runs/22158334822) | FAIL(1件) | `ページ遷移を待機()` 追加で50/51パス。`test_extend_same_table_crossed_local`(mysql) のみ: atPage成功後に有効化のフラッシュメッセージ未検出。同一URLリダイレクトで atPage が古いページのタイトルを拾う |
| [#22159345118](https://github.com/EC-CUBE/ec-cube/actions/runs/22159345118) | FAIL(1件) | stalenessOf 方式で50/51パス。`test_install_enable_disable_enable_disable_remove_local`(pgsql) で stalenessOf が30秒タイムアウト（html要素が stale にならない = ページ遷移が発生しなかった可能性） |
| [#22159726458](https://github.com/EC-CUBE/ec-cube/actions/runs/22159726458) | FAIL(2件) | JS マーカー方式で49/51パス。2件ともマーカーポーリング30秒タイムアウト（= click がナビゲーションをトリガーしなかった）: `test_install_enable_disable_enable_disable_remove_local`(pgsql) 2回目有効化、`test_extend_same_table_disabled_remove_local`(mysql) 無効化 |
| [#22160873232](https://github.com/EC-CUBE/ec-cube/actions/runs/22160873232) | FAIL(2件) | click リトライ + scrollTo で49/51パス。`test_install_enable_disable_enable_disable_remove_local` が mysql/pgsql 両方で失敗。3回リトライしても全失敗 = 構造的問題。CI アーティファクトの HTML 分析で原因特定 |
| 次回 | 待ち | document.readyState 待機を追加 |

## コミット履歴

1. `e905ca1558` - `see()` を `waitForText()` に変更、`完了メーッセージ`(typo) → `完了メッセージ` に修正
2. `62a58ae9b9` - ローカルプラグインアップロード後のページ遷移待機を追加（120秒）
3. `22a3c7b210` - ShopSettingPage の `登録()` で保存完了を待機するように修正
4. `5e6715940d` - アップロード後のページ遷移検出をフラッシュメッセージで行うように変更
5. `ff5166ab8b` - `waitForText` をページ遷移後に移動し、リトライを削除
6. `c39769aa91` - 完了メッセージのセレクタに `.alert-success` を追加し info alert との競合を解消
7. `660450147f` - セレクタを `:not(.alert-primary)` に変更（`.alert-success` 限定だと `alert-danger` の依存関係エラーを検出不可）
8. `10d912d079` - 有効化/無効化/削除/アップデート後に `ページ遷移を待機()` を追加
9. `7a53e4172c` - stalenessOf パターンで確実にページ遷移を検出（click 前に html 要素参照を保持、click 後に stale を検出してから atPage）→ stalenessOf が30秒タイムアウトするケースあり
10. `8479bb2f71` - **JS マーカー方式に変更（window.__eccubeNavMarker を設定、ページ再読み込みで消失を検出、遷移中の JS エラーもキャッチ）**
11. `61743dcd26` - **click リトライ方式**: `ページ遷移を伴うクリック(callable)` に統合。マーカーが10秒以内に消えなければ click をリトライ（最大3回）。`scrollTo` で要素をビューポートに入れてからクリック。
12. `2b3c05b847` - **document.readyState 待機**: click 前に `document.readyState === "complete"` を待機。function.js の click ハンドラが DOMContentLoaded 後にバインドされるため、ページ完全読み込みを保証。

---

## 問題3: click がページ遷移をトリガーしない（Run #22159726458 の原因）

### 現象

2件とも同パターン:
1. JS マーカーポーリングが30秒タイムアウト（マーカーが消えない = ページ遷移なし）
2. `atPage()` は同一 URL のため即成功
3. `waitForText` がフラッシュメッセージ未検出で30秒タイムアウト

### 根本原因（Run #22160873232 のアーティファクト分析で確定）

有効化/無効化ボタンの `<a>` タグは `data-method="post"` + `token-for-anchor` 属性を持ち、
JavaScript（function.js）がクリックをインターセプトして POST フォームを動的生成・送信する。

```
function.js (HTML body末尾 L2172 で読み込み):
  Ladda.bind('a[token-for-anchor]', {timeout: 2000});  ← 即時実行
  $(function() {
    $('a[token-for-anchor]').click(function(e) {        ← DOMContentLoaded 後にバインド
      e.preventDefault();
      // ... POST フォーム生成 & submit
    });
  });
```

`atPage()` はページタイトルの表示（HTML body 上部）だけで通過するが、
function.js は HTML body 末尾で読み込まれるため、**ページタイトル表示時点で
JS のクリックハンドラがまだバインドされていない**場合がある。

1回目の有効化/無効化が成功する理由: インストール直後は URL 遷移 + 多数の
アサーション実行で十分な時間が経過し、JS が初期化済み。

2回目が必ず失敗する理由: 前回操作の flash 確認 → DB チェック → 即 click
の間に function.js の読み込みが完了しない。Ladda だけが先に初期化されて
ボタンを disabled にするため、後続のクリックも効かなくなる。

### 修正

1. `scrollTo($xpath)` をボタンクリック前に追加（要素をビューポートに入れる）
2. `ページ遷移を伴うクリック(callable)` メソッドに統合:
   - マーカー設定 → click → 10秒待機 → 消えなければリトライ（最大3回）
   - 最終試行のみ30秒待機
   - マーカー設定自体が失敗した場合は前回クリックで遷移中と判断して break
3. **click 前に `document.readyState === "complete"` を待機**（Run #22160873232 で追加）:
   - function.js を含む全リソースの読み込み完了を保証
   - DOMContentLoaded 後の jQuery ハンドラバインドも完了済みになる

---

## 問題1: `see()` → `waitForText()` で動作が変わる（Run #22140430792 の原因）

### 現象

全6件の `_local` テストが同じエラーで失敗:

```
TimeoutException: Waited for 30 secs but text 'プラグインをインストールしました。' still not found
```

ページタイトル待機（Step 18）は成功するが、フラッシュメッセージ待機（Step 20）でタイムアウト。

### 根本原因

`PluginController::install()` (L488) が `addInfoOnce('admin.common.restrict_file_upload_info')` を呼ぶため、リダイレクト先のプラグイン管理ページに **2つのフラッシュメッセージ** が表示される:

```html
<!-- alert.twig のレンダリング順 -->
<!-- 1. eccube.admin.info → alert-primary (青) -->
<div class="alert alert-primary alert-dismissible fade show m-3">
    <span class="fw-bold">この機能の利用頻度が低い場合...ECCUBE_RESTRICT_FILE_UPLOAD...</span>
</div>

<!-- 2. eccube.admin.success → alert-success (緑) -->
<div class="alert alert-success alert-dismissible fade show m-3">
    <span class="fw-bold">プラグインをインストールしました。</span>
</div>
```

CSSセレクタ `div.alert.alert-dismissible.fade.show.m-3 > span` は **両方にマッチ** する。

- **`see()`** は全マッチ要素のテキストを結合して検索 → 2番目の alert のテキストも見つかる → **成功**
- **`waitForText()`** は `WebDriverExpectedCondition::elementTextContains` を使い、**最初のマッチ要素のみ** を検索 → info alert の span しか見ない → **タイムアウト**

### 修正

1. `c39769aa91` - セレクタに `.alert-success` を追加 → `_local` テストは全パスしたが `test_dependency_plugin_install` が失敗
2. `660450147f` - `:not(.alert-primary)` に変更（info のみ除外、success/danger/warning は全て対象）

```diff
  # 元
  div.alert.alert-dismissible.fade.show.m-3 > span
  # c39769aa91（.alert-success 限定 → danger が検出不可で NG）
  div.alert.alert-success.alert-dismissible.fade.show.m-3 > span
  # 660450147f（info のみ除外 → 最終形）
  div.alert:not(.alert-primary).alert-dismissible.fade.show.m-3 > span
```

`完了メッセージ` セレクタは成功メッセージだけでなく依存関係エラー（`alert-danger`）の検出にも使われている:
- `ストアプラグイン_有効化($pluginCode, $message)` で `$message` に依存関係エラーを渡すケース
- `test_dependency_plugin_install` テストがこのパターン

### 検証に使ったアーティファクト

失敗時の HTML/スクリーンショットを `/tmp/artifacts/` にダウンロード済み（CI アーティファクト）。
HTML の L1958-1972 で2つの alert が確認できる。

---

## 問題2: `waitForText` がページ遷移をまたぐと検出に失敗する（Run #22138996632 の原因）

### 現象

- 全ての `_local` テストが失敗、全ての `_store` テストは成功
- 失敗時のスクリーンショットには `plugin already installed.` エラーが表示される

### 根本原因

2つの問題が重なっていた:

#### a) ページ遷移中の `waitForText`

`PluginLocalInstallPage::アップロード()` 内で、フォーム送信（POST）直後に `waitForText` を呼んでいた。
ローカルプラグインのインストールはフォーム POST → 302 リダイレクトを伴うフルページナビゲーション。
ChromeDriver のページ遷移ハンドリングにより、リダイレクト後のフラッシュメッセージを検出できないことがある。

Store テストは同一ページ上の AJAX 操作なのでこの問題が発生しない。

#### b) リトライが逆効果

`nick-invision/retry@v3` (`max_attempts: 2`) を使っていたが:

1. 1回目: プラグインインストール成功（DB登録済み）→ `waitForText` タイムアウトで失敗
2. 2回目: `_before()` はクリーンアップしない → 再アップロードで `plugin already installed.` エラー

### 修正 (ff5166ab8b)

1. リトライを削除
2. `waitForText` をページ遷移後に移動:
   - `PluginLocalInstallPage::アップロード()` → click 後は `PluginManagePage::at()` のみ（ページタイトル待機）
   - `Local_Plugin::インストール()` → `at()` 完了後にフラッシュメッセージを `waitForText` で確認

---

## テストのフロー（現在の実装）

```
Local_Plugin::インストール()
  ├─ PluginLocalInstallPage::go()
  │    └─ goPage('/store/plugin/install', '独自プラグインのアップロードオーナーズストア')
  ├─ PluginLocalInstallPage::アップロード()
  │    ├─ compressPlugin()
  │    ├─ attachFile()
  │    ├─ click() → フォーム POST → 302 リダイレクト
  │    └─ PluginManagePage::at()
  │         └─ atPage('インストールプラグイン一覧オーナーズストア')  ← ページ遷移完了検出
  └─ waitForText('プラグインをインストールしました。', 30, 完了メッセージ)  ← フラッシュメッセージ確認
```

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `codeception/acceptance/EA10PluginCest.php` | テスト本体。`Local_Plugin::インストール()` (L779-796) |
| `codeception/_support/Page/Admin/PluginLocalInstallPage.php` | アップロードページオブジェクト |
| `codeception/_support/Page/Admin/PluginManagePage.php` | 管理ページオブジェクト。`完了メッセージ` セレクタ (L18) |
| `codeception/_support/Page/Admin/AbstractAdminPageStyleGuide.php` | `atPage()` でページタイトル待機 (L27) |
| `src/Eccube/Controller/Admin/Store/PluginController.php` | `install()` アクション。`addInfoOnce` (L488) + `addSuccess` |
| `src/Eccube/Resource/template/admin/alert.twig` | フラッシュメッセージのレンダリング順: info → success → danger → error → warning |
| `.github/workflows/plugin-test.yml` | CI ワークフロー |

## 技術的な補足

- `see($text, $selector)` は全マッチ要素を結合して検索する
- `waitForText($text, $timeout, $selector)` は最初のマッチ要素のみを検索する
- `alert.twig` のレンダリング順: info(primary) → success → danger → error → warning
- `PluginController::install()` は `addInfoOnce` + `addSuccess` の2つのフラッシュを設定する
- `ECCUBE_RESTRICT_FILE_UPLOAD` は `plugin-test.yml` では設定されていないがデフォルト `'0'` でも info メッセージは表示される
- ページタイトルはインストールページ (`独自プラグインのアップロードオーナーズストア`) と管理ページ (`インストールプラグイン一覧オーナーズストア`) で異なるため、`atPage()` による遷移検出は正しく機能する

## 次に作業が必要な場合

- CI 結果を確認し、全テストがパスするか検証する
- まだ失敗する場合は、失敗時のアーティファクト（HTML/スクリーンショット）をダウンロードして DOM を確認する
- `_store` 系テストも `完了メッセージ` セレクタを使っているので、Store ページにも info alert が出ていないか確認する
