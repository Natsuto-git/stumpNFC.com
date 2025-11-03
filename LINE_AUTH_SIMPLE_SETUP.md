# LINE認証セットアップ（課金なし・Functions不要）

Firebase Functionsを使わずに、Firebase AuthenticationのLINEプロバイダーを直接使用する方法です。
**Blazeプランへのアップグレードは不要**です。

## 📋 作業手順（約10分）

### ステップ1: LINE Developers Consoleでチャネル作成

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. LINEアカウントでログイン
3. プロバイダーを作成（初回のみ）
4. **LINE Loginチャネルを作成**
5. **Channel ID** と **Channel Secret** をメモ

### ステップ2: LINE LoginのCallback URL設定

1. 作成したチャネルの「LINE Login設定」タブを開く
2. 「Callback URL」に以下を追加：
   ```
   http://localhost:5173/login
   https://あなたのVercelURL.com/login
   ```
3. 「保存」をクリック

### ステップ3: Firebase ConsoleでLINEプロバイダーを有効化

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. `stumpcard-app` プロジェクトを選択
3. 左メニューから「Authentication」をクリック
4. 「Sign-in method」タブをクリック
5. 「LINE」をクリック
6. 有効にする（トグルをON）
7. 以下を入力：
   - **Client ID**: LINE Developers Consoleで取得したChannel ID
   - **Client Secret**: LINE Developers Consoleで取得したChannel Secret
8. 「保存」をクリック

### ステップ4: 動作確認

1. ローカルでアプリを起動：
   ```bash
   npm run dev
   ```
2. ブラウザで `http://localhost:5173/login` にアクセス
3. 「LINEでログイン」ボタンをクリック
4. LINE認証画面が表示されればOK

---

## ✅ これで完了！

Firebase Functionsは不要です。既存のコード（`signInWithRedirect`と`OAuthProvider`）で動作します。

---

## ❓ よくある質問

### Q: Blazeプランは必要ですか？
A: **いいえ、不要です**。Firebase AuthenticationのLINEプロバイダーは無料プランでも使えます。

### Q: Functionsのコードはどうしますか？
A: 使わないので、削除しても問題ありませんが、残しておいても構いません。

### Q: エラーが出る場合は？
A: Firebase ConsoleでLINEプロバイダーが正しく設定されているか確認してください。

