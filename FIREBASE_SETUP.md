# Firebase セットアップ手順

このガイドでは、スタンプカードアプリにFirebase認証とFirestoreを設定する手順を説明します。

## ステップ1: Firebaseプロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. Googleアカウントでログイン
3. 「プロジェクトを追加」をクリック
4. プロジェクト名を入力（例: `stumpcard-app`）
5. Google Analyticsの設定は任意（スキップ可能）
6. 「プロジェクトを作成」をクリック
7. プロジェクトの作成が完了するまで待つ（数十秒）

## ステップ2: Webアプリを登録

1. Firebase Consoleで作成したプロジェクトを開く
2. 左側のメニューから「⚙️ プロジェクトの設定」をクリック
3. 「マイアプリ」セクションまでスクロール
4. 「</>」アイコン（ウェブ）をクリック
5. アプリのニックネームを入力（例: `stampcard-web`）
6. 「Firebase Hostingもセットアップしますか？」は「今はしない」でOK
7. 「アプリを登録」をクリック

## ステップ3: 設定情報をコピー

登録完了後、以下のようなコードが表示されます：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

これらの値をメモしておいてください。

## ステップ4: 認証（Authentication）を有効化

1. 左側のメニューから「Authentication」をクリック
2. 「始める」ボタンをクリック
3. 「Sign-in method」タブをクリック
4. 「メール/パスワード」をクリック
5. 「メール/パスワード」を有効にする（トグルをON）
6. 「保存」をクリック

## ステップ5: Firestore Databaseを作成

1. 左側のメニューから「Firestore Database」をクリック
2. 「データベースを作成」をクリック
3. セキュリティルールの選択：
   - **開発中**: 「テストモードで開始」を選択（後で変更可能）
   - **本番環境**: 「本番モードで開始」を選択（推奨）
4. ロケーションを選択（例: `asia-northeast1` (東京)）
5. 「有効にする」をクリック

### テストモードの場合のセキュリティルール例

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

セキュリティルールを設定するには：
1. Firestore Database ページで「ルール」タブをクリック
2. 上記のルールを貼り付け
3. 「公開」をクリック

## ステップ6: 環境変数を設定

1. プロジェクトルートに `.env` ファイルを作成

```bash
# .envファイルを作成
touch .env
```

2. `.env` ファイルに以下の内容を記入（ステップ3でコピーした値を使用）：

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**重要**: `.env` ファイルは `.gitignore` に追加して、Gitにコミットしないでください。

## ステップ7: アプリを再起動

環境変数を変更したら、開発サーバーを再起動してください：

```bash
# サーバーを停止（Ctrl+C）
# その後、再起動
npm run dev
```

## ステップ8: 動作確認

1. アプリを起動: `npm run dev`
2. ブラウザで `http://localhost:5173` にアクセス
3. 「新規会員登録」をクリック
4. テスト用のメールアドレスとパスワード（6文字以上）を入力
5. 「登録する」をクリック
6. 成功したら、Firebase Consoleの「Authentication」でユーザーが表示されることを確認
7. Firestore Databaseの「データ」タブで、`users`コレクションにデータが保存されていることを確認

## トラブルシューティング

### エラー: "Firebase: Error (auth/configuration-not-found)"
- 環境変数が正しく設定されているか確認
- `.env` ファイルがプロジェクトルートにあるか確認
- 開発サーバーを再起動したか確認

### エラー: "Firebase: Error (auth/email-already-in-use)"
- そのメールアドレスは既に登録されています
- 別のメールアドレスを使用するか、ログインページからログインしてください

### エラー: "Firebase: Error (permission-denied)"
- Firestoreのセキュリティルールを確認
- テストモードの場合は、30日間有効です

## 本番環境へのデプロイ

Vercelなどにデプロイする場合は、環境変数をVercelのダッシュボードでも設定する必要があります：

1. Vercelダッシュボードにアクセス
2. プロジェクトの「Settings」→「Environment Variables」を開く
3. 各環境変数を追加（`.env` と同じ内容）

