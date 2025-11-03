# LINE認証のセットアップ手順

このガイドでは、Firebase Functionsを使ったLINE認証のセットアップ方法を説明します。

## ステップ1: LINE Developers Consoleでの設定

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. プロバイダーを作成（まだの場合）
3. 「チャネル」を作成 → 「LINE Login」を選択
4. チャネル情報から以下を取得：
   - **Channel ID** (チャネルID)
   - **Channel Secret** (チャネルシークレット)

## ステップ2: LINE Loginチャネルの設定

1. LINE Developers Consoleで作成したチャネルを開く
2. 「Callback URL」に以下を追加：
   ```
   http://localhost:5173/login (開発環境)
   https://stumpcard-app.web.app/login (本番環境)
   https://あなたのVercelURL.com/login (Vercelデプロイの場合)
   ```

## ステップ3: Firebase Functionsの環境変数を設定

Firebase Functionsの環境変数を設定します：

```bash
# Firebase CLIでログイン（まだの場合）
firebase login

# 環境変数を設定
firebase functions:config:set \
  line.channel_id="YOUR_CHANNEL_ID" \
  line.channel_secret="YOUR_CHANNEL_SECRET" \
  line.callback_url="http://localhost:5173/login"
```

または、本番環境用：

```bash
firebase functions:config:set \
  line.channel_id="YOUR_CHANNEL_ID" \
  line.channel_secret="YOUR_CHANNEL_SECRET" \
  line.callback_url="https://stumpcard-app.web.app/login"
```

## ステップ4: Firebase Functionsをデプロイ

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

## ステップ5: フロントエンドの更新

フロントエンド側で、LINE Login APIを使用して認証コードを取得し、Firebase Functionに送信するように更新します。

## 注意事項

- Channel Secretは絶対に公開しないでください
- 本番環境では、Callback URLに適切なドメインを設定してください
- Firebase Functionsは東京リージョン(`asia-northeast1`)で動作します

