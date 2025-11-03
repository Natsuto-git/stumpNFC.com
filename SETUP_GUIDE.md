# LINE認証セットアップ 完全ガイド

このガイドでは、LINE認証を実装するためにあなたが行う必要があるすべての作業を、ステップバイステップで説明します。

## 📋 作業の全体像

1. **LINE Developers Consoleでチャネル作成** ← まずここから
2. **LINE Loginの設定（Callback URL登録）**
3. **Firebase Functionsの環境変数設定**
4. **Firebase Functionsをデプロイ**
5. **フロントエンドの更新（コード変更）** ← これは後で一緒にやります

---

## ステップ1: LINE Developers Consoleでチャネルを作成

### 1-1. LINE Developers Consoleにアクセス
1. ブラウザで [https://developers.line.biz/console/](https://developers.line.biz/console/) を開く
2. LINEアカウントでログイン

### 1-2. プロバイダーを作成（初回のみ）
1. 左上の「プロバイダー」をクリック
2. 「作成」ボタンをクリック
3. プロバイダー名を入力（例: `LotusCard`）
4. 「作成」をクリック

### 1-3. LINE Loginチャネルを作成
1. 作成したプロバイダーを選択
2. 「チャネル」タブをクリック
3. 「作成」ボタンをクリック
4. 「LINE Login」を選択
5. チャネル名を入力（例: `LotusCard Login`）
6. チャネル説明を入力（任意）
7. アプリタイプ: **Web app** を選択
8. メールアドレスを入力
9. 「利用規約に同意」にチェック
10. 「作成」をクリック

### 1-4. 重要な情報をメモ
チャネル作成後、以下の画面が表示されます。**必ずメモしてください**：

```
Channel ID: 1234567890（この数字をコピー）
Channel Secret: abcdefghijklmnopqrstuvwxyz（この文字列をコピー）
```

⚠️ **重要**: これらの情報は後で使うので、安全な場所に保存してください。

---

## ステップ2: LINE LoginのCallback URLを設定

### 2-1. チャネル設定ページを開く
1. 作成したLINE Loginチャネルのページを開く
2. 上部のタブから「LINE Login設定」をクリック

### 2-2. Callback URLを追加
1. 「Callback URL」セクションまでスクロール
2. 「追加」ボタンをクリック
3. 以下のURLを追加（**開発環境用**）:
   ```
   http://localhost:5173/login
   ```
4. さらに追加（**本番環境用** - VercelのURL）:
   ```
   https://あなたのVercelURL.com/login
   ```
   ※ VercelのURLがわからない場合は、後で追加でもOK
5. 「保存」をクリック

---

## ステップ3: Firebase CLIのインストールとログイン

### 3-1. Firebase CLIがインストールされているか確認
ターミナルで以下のコマンドを実行：

```bash
firebase --version
```

もしエラーが出る場合は、インストール：

```bash
npm install -g firebase-tools
```

### 3-2. Firebaseにログイン
ターミナルで以下を実行：

```bash
firebase login
```

ブラウザが開くので、Googleアカウントでログインしてください。

---

## ステップ4: Firebase Functionsの環境変数を設定

### 4-1. プロジェクトのルートディレクトリに移動
ターミナルで以下を実行（既にいる場合はスキップ）：

```bash
cd "/Users/natsutoyamaguchi/Documents/LotusCard　/Stumpcard/stumpNFC.com"
```

### 4-2. 環境変数を設定
**ステップ1-4でメモした値**を使って、以下を実行：

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
- `"`（ダブルクォート）を忘れずにつけてください
- Channel IDとChannel Secretは実際の値に置き換えてください

### 4-3. 設定を確認（オプション）
設定が正しく保存されたか確認：

```bash
firebase functions:config:get
```

---

## ステップ5: Firebase Functionsをデプロイ

### 5-1. functionsディレクトリで依存関係をインストール
ターミナルで以下を実行：

```bash
cd functions
npm install
```

### 5-2. ビルドして確認
```bash
npm run build
```

エラーが出なければOKです。

### 5-3. プロジェクトルートに戻る
```bash
cd ..
```

### 5-4. Functionsをデプロイ
```bash
firebase deploy --only functions
```

これには数分かかります。デプロイが成功すると、以下のようなメッセージが表示されます：

```
✔  functions[createFirebaseTokenFromLine(asia-northeast1)] Successful create operation.
Function URL: https://asia-northeast1-stumpcard-app.cloudfunctions.net/createFirebaseTokenFromLine
```

⚠️ **重要**: このFunction URLをメモしてください。後で使います。

---

## ステップ6: 確認とテスト

### 6-1. Firebase Consoleで確認
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. 左メニューから「Functions」をクリック
4. `createFirebaseTokenFromLine` というFunctionが表示されていればOK

### 6-2. エラーログの確認方法
もしエラーが出た場合：

```bash
firebase functions:log
```

---

## 📝 チェックリスト

以下を全て完了してください：

- [ ] LINE Developers Consoleでチャネルを作成
- [ ] Channel IDとChannel Secretをメモ
- [ ] Callback URLを設定（`http://localhost:5173/login`）
- [ ] Firebase CLIでログイン
- [ ] 環境変数を設定（`firebase functions:config:set`）
- [ ] Functionsをデプロイ（`firebase deploy --only functions`）
- [ ] Function URLをメモ

---

## ❓ よくある質問

### Q: Channel IDやChannel Secretを忘れてしまった
A: LINE Developers Consoleにログイン → 作成したチャネルを開く → 「基本設定」タブで確認できます

### Q: デプロイが失敗する
A: `firebase functions:log` でエラーログを確認してください。よくある原因：
- 環境変数が設定されていない
- Firebaseプロジェクトが正しく選択されていない

### Q: VercelのURLがわからない
A: Vercelにデプロイした後、設定ページで確認できます。または、`vercel.json`の設定を確認してください。

---

## 🎯 次のステップ

これらの設定が完了したら、フロントエンド側のコードを更新します。
まずは上記のステップを完了させてください！

