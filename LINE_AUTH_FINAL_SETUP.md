# LINE認証セットアップ（最終版・Firebase Functions使用）

LINE認証を使うには、Firebase Functionsが必要です。ただし、**無料枠内なら課金されません**。

## ⚠️ 重要な情報

### Firebase Functionsの無料枠
- **月200万回の呼び出しまで無料**
- 小規模なアプリなら、追加料金は発生しません
- Blazeプランへのアップグレードは必要ですが、無料枠内なら実質無料

### Blazeプランについて
- クレジットカード登録は必要
- 無料枠を超えた場合のみ課金
- 小規模なスタンプカードアプリなら、無料枠で十分

---

## 📋 セットアップ手順

### ステップ1: Firebase Functionsの環境変数を設定

```bash
firebase functions:config:set \
  line.channel_id="YOUR_CHANNEL_ID" \
  line.channel_secret="YOUR_CHANNEL_SECRET" \
  line.callback_url="http://localhost:5173/login"
```

### ステップ2: Firebase Functionsをデプロイ

Blazeプランへのアップグレードが必要です：

1. [Firebase Console](https://console.firebase.google.com/project/stumpcard-app/usage/details) にアクセス
2. Blazeプランにアップグレード（クレジットカード登録が必要）
3. デプロイ：

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### ステップ3: LINE Developers Consoleで設定

1. Channel IDとChannel Secretを取得
2. Callback URLに以下を追加：
   - `http://localhost:5173/login`
   - `https://あなたのVercelURL.com/login`

---

## 💡 無料枠について

### Functionsの無料枠
- **月200万回の呼び出しまで無料**
- 1日あたり約6.6万回まで無料

### 実際の使用量
- スタンプカードアプリのログインは、ユーザーがログインする時だけ
- 1日100回ログインでも、月3000回程度
- 無料枠（200万回）の0.15%程度

**結論**: 実質無料で使えます！

---

## 🎯 次のステップ

1. Blazeプランにアップグレード（クレジットカード登録が必要だが、無料枠内なら課金なし）
2. 環境変数を設定
3. Functionsをデプロイ
4. フロントエンドのコードが既に更新済みなので、すぐ使えます

