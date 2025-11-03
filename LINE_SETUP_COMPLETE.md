# LINE認証セットアップ 完全手順書

LINE認証を実装するために、あなたが行う必要がある作業を**順番に**説明します。

---

## ⚠️ 重要：無料枠について

Firebase Functionsには**無料枠があります**：
- **月200万回の呼び出しまで無料**
- スタンプカードアプリのログインなら、実質無料で使えます
- Blazeプランへのアップグレードは必要ですが、無料枠内なら課金されません

---

## 📝 やることリスト（順番通りに）

### ✅ ステップ1: Firebase Blazeプランにアップグレード

1. [Firebase Console](https://console.firebase.google.com/project/stumpcard-app/usage/details) にアクセス
2. 「プランをアップグレード」をクリック
3. Blazeプラン（従量課金）を選択
4. クレジットカード情報を入力
   - ⚠️ **無料枠内なら課金されません**（月200万回まで無料）

**所要時間**: 約3分

---

### ✅ ステップ2: LINE Developers Consoleでチャネル作成

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. プロバイダーを作成（初回のみ）
3. **LINE Loginチャネルを作成**
   - 「チャネル」→「作成」→「LINE Login」を選択
   - チャネル名を入力（例: `LotusCard Login`）
   - アプリタイプ: **Web app**
4. **重要な情報をメモ**：
   - **Channel ID**（数字）
   - **Channel Secret**（文字列）
   - ⚠️ 後で使うので、必ずメモしてください

**所要時間**: 約5分

---

### ✅ ステップ3: LINE LoginのCallback URLを設定

1. 作成したLINE Loginチャネルのページを開く
2. 「LINE Login設定」タブをクリック
3. 「Callback URL」セクションで「追加」をクリック
4. 以下を追加：
   ```
   http://localhost:5173/login
   ```
5. 本番環境のURLも追加（VercelのURLがわかったら）：
   ```
   https://あなたのVercelURL.com/login
   ```
6. 「保存」をクリック

**所要時間**: 約2分

---

### ✅ ステップ4: Firebase Functionsの環境変数を設定

ターミナルで以下を実行（**ステップ2でメモした値**を使用）：

```bash
firebase functions:config:set \
  line.channel_id="ここにChannel IDを貼り付け" \
  line.channel_secret="ここにChannel Secretを貼り付け" \
  line.callback_url="http://localhost:5173/login"
```

**例**:
```bash
firebase functions:config:set \
  line.channel_id="1234567890" \
  line.channel_secret="abcdefghijklmnopqrstuvwxyz" \
  line.callback_url="http://localhost:5173/login"
```

⚠️ **注意**: 
- `"`（ダブルクォート）を忘れずに
- 実際の値に置き換えてください

**所要時間**: 約1分

---

### ✅ ステップ5: Firebase Functionsをデプロイ

ターミナルで以下を順番に実行：

```bash
# プロジェクトルートにいることを確認
cd "/Users/natsutoyamaguchi/Documents/LotusCard　/Stumpcard/stumpNFC.com"

# functionsディレクトリに移動
cd functions

# 依存関係をインストール
npm install

# ビルド
npm run build

# プロジェクトルートに戻る
cd ..

# デプロイ
firebase deploy --only functions
```

**所要時間**: 約5-10分（初回は時間がかかります）

デプロイが成功すると、以下のようなメッセージが表示されます：
```
✔  functions[createFirebaseTokenFromLine(asia-northeast1)] Successful create operation.
Function URL: https://asia-northeast1-stumpcard-app.cloudfunctions.net/createFirebaseTokenFromLine
```

⚠️ **重要**: このFunction URLをメモしてください！

---

### ✅ ステップ6: フロントエンドの環境変数を設定

プロジェクトルートに `.env` ファイルを作成（既にある場合は更新）：

```bash
# .envファイルを開く
nano .env
```

以下を追加（**実際の値に置き換えてください**）：

```env
VITE_FIREBASE_API_KEY=あなたのFirebase API Key
VITE_FIREBASE_AUTH_DOMAIN=あなたのFirebase Auth Domain
VITE_FIREBASE_PROJECT_ID=あなたのFirebase Project ID
VITE_FIREBASE_STORAGE_BUCKET=あなたのFirebase Storage Bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=あなたのFirebase Messaging Sender ID
VITE_FIREBASE_APP_ID=あなたのFirebase App ID

# LINE認証用（ステップ2とステップ5で取得した値）
VITE_LINE_CHANNEL_ID=あなたのChannel ID
VITE_LINE_CALLBACK_URL=http://localhost:5173/login
VITE_FIREBASE_FUNCTION_URL=https://asia-northeast1-stumpcard-app.cloudfunctions.net/createFirebaseTokenFromLine
```

**所要時間**: 約3分

---

### ✅ ステップ7: 動作確認

1. 開発サーバーを再起動：
   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:5173/login` にアクセス

3. 「LINEでログイン」ボタンをクリック

4. LINE認証画面が表示されればOK！

**所要時間**: 約2分

---

## ✅ 完了チェックリスト

全て完了したら、以下を確認：

- [ ] Firebase Blazeプランにアップグレード済み
- [ ] LINE Developers Consoleでチャネル作成済み
- [ ] Channel IDとChannel Secretをメモ済み
- [ ] LINE LoginのCallback URLを設定済み
- [ ] Firebase Functionsの環境変数を設定済み
- [ ] Firebase Functionsをデプロイ済み
- [ ] Function URLをメモ済み
- [ ] フロントエンドの.envファイルを更新済み
- [ ] 動作確認済み

---

## ❓ よくある質問

### Q: 無料枠内なら本当に無料ですか？
A: はい。月200万回まで無料です。小規模なアプリなら追加料金は発生しません。

### Q: Channel IDやChannel Secretを忘れた
A: LINE Developers Console → 作成したチャネル → 「基本設定」タブで確認できます

### Q: Function URLがわからない
A: デプロイ成功時に表示されます。または、Firebase Console → Functions → `createFirebaseTokenFromLine` をクリック

### Q: エラーが出る
A: 各ステップが正しく完了しているか確認してください。特に：
- 環境変数が正しく設定されているか
- Callback URLが正しく設定されているか

---

## 🎯 次のステップ

全てのステップが完了したら、スマホでテストしてください！

