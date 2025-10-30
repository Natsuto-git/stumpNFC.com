# stumpNFC.com

## Googleログイン設定（Google Identity Services）

1. Google Cloud Console で OAuth 同意画面を作成 → 公開
2. 認証情報 → 「OAuth 2.0 クライアントID（Web）」作成
   - 承認済みのJavaScript生成元: `http://localhost:5173`, `https://<本番ドメイン>`
   - リダイレクトURIは不要（One Tap / Credential 回収方式）
3. プロジェクト直下に `.env` を作成し、以下を設定

```
VITE_GOOGLE_CLIENT_ID=あなたのOAuthクライアントID.apps.googleusercontent.com
```

4. 起動

```
npm run dev
```

トップページに「Googleでログイン」ボタンと One Tap が表示されます。

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
5. デプロイURLを Google Cloud の承認済みドメイン/生成元に追加

補足
- `vercel.json` は static build（Viteの `dist`）を公開する設定です。
- 本番は `.env.production` が自動で読み込まれます（`VITE_*` だけ公開可）。
- もしVercelダッシュボードの環境変数を使う場合は、同じ値を設定すればOKです。

stumpNFC.com
