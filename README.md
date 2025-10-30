# stumpNFC.com

## LINEログイン設定

1. LINE Developers で LIFF アプリを作成し、LIFF ID を取得します。
2. プロジェクト直下に `.env` を作成し、以下を設定します。

```
VITE_LIFF_ID=あなたのLIFF_ID
# 任意: リダイレクト先を固定したい場合に指定（未指定なら現URL）
VITE_LIFF_REDIRECT_URI=https://あなたのドメイン/
# 任意: LINEアプリ外で開いたとき、LIFF URLに自動遷移してLINEアプリを起動
VITE_FORCE_OPEN_IN_LINE=true
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
- さらに“できるだけLINEアプリで開かせたい”場合は `VITE_FORCE_OPEN_IN_LINE=true` を設定
  - ブラウザでアクセス→未ログイン→自動で `https://liff.line.me/<LIFF_ID>` に遷移→LINEアプリが起動
  - 既にLINEアプリでログイン済みなら、アカウント選択なしでスムーズに進みやすい

## デプロイ（Vercel + GitHub Actions）

1. Vercelでプロジェクト作成（GitHubの `Natsuto-git/stumpNFC.com` をImport）
2. VercelのProject Settings → Environment Variables に以下を追加
   - `VITE_LIFF_ID`（必須）
   - `VITE_LIFF_REDIRECT_URI`（任意）
3. GitHubリポジトリの Settings → Secrets and variables → Actions に追加
   - `VERCEL_TOKEN`（VercelのPersonal Token）
   - `VERCEL_ORG_ID`（VercelのOrganization ID）
   - `VERCEL_PROJECT_ID`（当該プロジェクトID）
   - `VITE_LIFF_ID`／`VITE_LIFF_REDIRECT_URI`（任意）
4. mainにプッシュすると `.github/workflows/deploy-vercel.yml` が自動で本番デプロイ
5. デプロイURLを LINE Developers のLIFF「エンドポイントURL」に登録

補足
- `vercel.json` は static build（Viteの `dist`）を公開する設定です。
- 本番は `.env.production` が自動で読み込まれます（`VITE_*` だけ公開可）。
- もしVercelダッシュボードの環境変数を使う場合は、同じ値を設定すればOKです。

stumpNFC.com
