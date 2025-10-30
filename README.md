# stumpNFC.com

## LINEログイン設定

1. LINE Developers で LIFF アプリを作成し、LIFF ID を取得します。
2. プロジェクト直下に `.env` を作成し、以下を設定します。

```
VITE_LIFF_ID=あなたのLIFF_ID
# 任意: リダイレクト先を固定したい場合に指定（未指定なら現URL）
VITE_LIFF_REDIRECT_URI=https://あなたのドメイン/
```

3. 開発/本番URLを LIFF のエンドポイントURLやコールバックURLに登録してください。
   - 例: `http://localhost:5173/` や デプロイ先のURL

4. 起動

```
npm run dev
```

トップページに「LINEでログイン」ボタンが表示され、未ログイン時は LIFF のログイン画面に遷移します。

### 自動ログインについて

本プロジェクトは未ログインの場合、ページ読み込み時に自動で `liff.login()` を実行します。

- LIFF アプリのスコープに少なくとも `openid` と `profile` を設定
- LIFF エンドポイントURLに、実際にアクセスするURL（本番/開発）を登録
- 外部ブラウザからも開ける通常のウェブアプリ（LIFF v2）として設定
- 必要に応じて `.env` に `VITE_LIFF_REDIRECT_URI` を指定

stumpNFC.com
