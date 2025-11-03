# LotusCard スタンプカードアプリ - 現状まとめ

**作成日**: 2024年
**バージョン**: 1.0.0
**プロジェクト名**: stumpNFC.com

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [プロジェクト構造](#プロジェクト構造)
4. [主要機能一覧](#主要機能一覧)
5. [コンポーネント構成](#コンポーネント構成)
6. [データ管理・状態管理](#データ管理状態管理)
7. [ルーティング](#ルーティング)
8. [認証・データストレージ](#認証データストレージ)
9. [デプロイメント情報](#デプロイメント情報)
10. [環境変数設定](#環境変数設定)
11. [実装済み機能の詳細](#実装済み機能の詳細)
12. [今後の改善案](#今後の改善案)

---

## 🎯 プロジェクト概要

**LotusCard**は、飲食店向けのスタンプカードWebアプリケーションです。ユーザーはスタンプを貯めることでクーポンを獲得でき、Firebase認証により複数デバイス間でデータを同期できます。

### 主要な特徴
- ✅ 10個のスタンプでカード完成
- ✅ スタンプ5個で「ドリンク1杯無料」クーポン
- ✅ スタンプ10個で「10%オフ」クーポン
- ✅ カード完成時に自動リセット
- ✅ スタンプ履歴・統計機能
- ✅ 達成バッジシステム
- ✅ オフライン対応
- ✅ Firebase認証（Email/Password）
- ✅ Firestoreデータベース連携

---

## 🛠 技術スタック

### フロントエンド
- **React 18.3.1** - UIフレームワーク
- **TypeScript 5.5.3** - 型安全性
- **Vite 5.4.2** - ビルドツール
- **Tailwind CSS 3.4.1** - スタイリング
- **React Router DOM 6.26.2** - ルーティング

### UIライブラリ
- **shadcn/ui** - UIコンポーネント基盤
- **Radix UI** - アクセシブルなUIプリミティブ
- **lucide-react 0.344.0** - アイコン
- **sonner 2.0.7** - トースト通知

### バックエンド・認証
- **Firebase 12.5.0**
  - Firebase Authentication (Email/Password)
  - Cloud Firestore (データベース)

### ユーティリティ
- **date-fns 4.1.0** - 日付処理
- **qrcode.react 4.2.0** - QRコード生成
- **clsx** / **tailwind-merge** - クラス名ユーティリティ

### 開発ツール
- **ESLint 9.9.1** - リンター
- **TypeScript ESLint** - TypeScript用リンター
- **PostCSS** / **Autoprefixer** - CSS処理
- **vite-plugin-pwa 1.1.0** - PWA対応（未実装）

---

## 📁 プロジェクト構造

```
stumpNFC.com/
├── public/                    # 静的ファイル
│   ├── 10%クーポン.png
│   ├── 5-2-6-3.webp          # 背景画像
│   ├── favicon.svg
│   ├── robots.txt
│   ├── stamp-empty.png       # 空のスタンプ画像
│   ├── stamp-filled.png      # 埋まったスタンプ画像
│   └── ドリンク１杯無料.png
│
├── src/
│   ├── components/           # Reactコンポーネント
│   │   ├── ui/               # 再利用可能なUIコンポーネント
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   └── tabs.tsx
│   │   ├── AchievementBadges.tsx    # 達成バッジ表示
│   │   ├── CouponModal.tsx          # クーポン表示モーダル
│   │   ├── ErrorBoundary.tsx        # エラーハンドリング
│   │   ├── LoadingSpinner.tsx       # ローディング表示
│   │   ├── MobileStampCard.tsx       # メインスタンプカード
│   │   ├── QRCodeModal.tsx          # QRコード表示モーダル
│   │   ├── StampAnimation.tsx       # スタンプ獲得アニメーション
│   │   ├── StampHistory.tsx         # スタンプ履歴・統計
│   │   └── StampSlot.tsx            # 個別スタンプスロット
│   │
│   ├── hooks/                # カスタムフック
│   │   ├── useFirestoreStampCard.ts  # Firestoreデータ管理
│   │   ├── useOfflineSync.ts         # オフライン同期
│   │   ├── useSecureStampCard.ts    # localStorageデータ管理
│   │   └── use-toast.ts              # トースト通知
│   │
│   ├── lib/                  # ライブラリ・ユーティリティ
│   │   ├── firebase.ts               # Firebase初期化
│   │   ├── types.ts                  # TypeScript型定義
│   │   └── utils.ts                  # ユーティリティ関数
│   │
│   ├── pages/                # ページコンポーネント
│   │   ├── Card.tsx                 # メインスタンプカードページ
│   │   ├── Index.tsx                # トップページ（ランディング）
│   │   ├── Login.tsx                # ログインページ
│   │   ├── NotFound.tsx             # 404ページ
│   │   └── Register.tsx             # 新規登録ページ
│   │
│   ├── App.tsx              # ルートコンポーネント
│   ├── main.tsx             # エントリーポイント
│   ├── index.css            # グローバルスタイル
│   └── vite-env.d.ts        # Vite型定義
│
├── dist/                     # ビルド出力（.gitignore）
├── node_modules/             # 依存パッケージ
│
├── .env.example              # 環境変数テンプレート
├── .gitignore                # Git除外設定
├── eslint.config.js          # ESLint設定
├── index.html                # HTMLエントリーポイント
├── package.json              # プロジェクト設定・依存関係
├── package-lock.json         # 依存関係ロック
├── postcss.config.js         # PostCSS設定
├── README.md                 # 基本的な説明
├── FIREBASE_SETUP.md         # Firebase設定ガイド
├── tailwind.config.js        # Tailwind CSS設定
├── tsconfig.json             # TypeScript設定
├── tsconfig.app.json         # TypeScriptアプリ設定
├── tsconfig.node.json        # TypeScript Node設定
├── vercel.json               # Vercelデプロイ設定
└── vite.config.ts            # Vite設定

```

---

## ✨ 主要機能一覧

### 1. スタンプカード機能
- **10個のスタンプスロット**（2列×5行のグリッド）
- **スタンプ獲得アニメーション**（中央に大きく表示→スロットにスライド）
- **スタンプ画像の交互表示**（2種類のスタンプデザインを交互に使用）
- **進捗バー表示**（パーセンテージ表示）
- **累計スタンプ数の表示**

### 2. クーポンシステム
- **ドリンク1杯無料クーポン**（スタンプ5個獲得時）
- **10%オフクーポン**（スタンプ10個獲得時）
- **クーポンモーダル表示**（獲得時のバナー）
- **QRコード生成**（クーポン使用時にランダムQRコード表示）
- **使用済みクーポンの非表示**
- **クーポンリセット機能**

### 3. 自動リセット機能
- **累計スタンプが10の倍数**になったら自動的にカードをリセット
- リセット時は`lastStampDate`もクリアされ、即座にスタンプ獲得可能

### 4. スタンプ履歴・統計機能
- **総スタンプ数**の表示
- **今月の獲得数**の表示
- **直近7日間の履歴**表示（日付と獲得数）

### 5. 達成バッジシステム
- **初めてのお客様**（1スタンプ獲得）
- **ブロンズ会員**（スタンプカード1枚完成）
- **シルバー会員**（スタンプカード3枚完成）
- **ゴールド会員**（スタンプカード6枚完成）
- **プラチナ会員**（スタンプカード10枚完成）

### 6. 認証機能
- **Firebase Email/Password認証**
- **新規会員登録**
- **ログイン/ログアウト**
- **認証状態に応じたデータストレージ切り替え**
  - ログイン済み: Firestore
  - 未ログイン: localStorage

### 7. オフライン対応
- **オフライン状態の検知**
- **オフライン時の操作をキューに保存**
- **オンライン復帰時の自動同期**
- **オフライン/同期中状態の表示**

### 8. エラーハンドリング
- **ErrorBoundary**によるエラーキャッチ
- **ローディング状態の表示**
- **トースト通知**による成功/エラーメッセージ

### 9. UI/UX
- **レスポンシブデザイン**（モバイル最適化）
- **落ち着いたカフェ風デザイン**（茶色ベース、レトロ調）
- **背景画像対応**（5-2-6-3.webp）
- **アニメーション**（スタンプ獲得、モーダル表示）

---

## 🧩 コンポーネント構成

### ページコンポーネント

#### `Index.tsx` - トップページ
- **役割**: アプリのエントリーポイント
- **機能**: 
  - 新規会員登録へのリンク
  - ログインページへのリンク
  - ゲストモード（スタンプカード表示）へのリンク

#### `Card.tsx` - メインスタンプカードページ
- **役割**: スタンプカード機能のコアページ
- **主要機能**:
  - スタンプカード表示
  - スタンプ追加処理
  - クーポン管理
  - タブ切り替え（クーポン/履歴/バッジ）
  - オフライン状態表示
  - ログアウト機能

#### `Login.tsx` - ログインページ
- **機能**: Firebase Email/Password認証でログイン

#### `Register.tsx` - 新規登録ページ
- **機能**: 新規アカウント作成とFirestore初期化

#### `NotFound.tsx` - 404ページ
- **機能**: 存在しないルートへのアクセス時に表示

### UIコンポーネント

#### `MobileStampCard.tsx`
- メインのスタンプカード表示
- スタンプスロットのグリッド表示
- 進捗バー表示
- 累計スタンプ数表示

#### `StampSlot.tsx`
- 個別スタンプスロット
- 空/埋まり状態の表示
- 5個目と10個目のスロットに特別メッセージ表示

#### `StampAnimation.tsx`
- スタンプ獲得時のアニメーション
- 中央に大きく表示→ターゲットスロットにスライド

#### `CouponModal.tsx`
- クーポン詳細表示
- クーポン使用機能
- 画像表示（ドリンク無料/10%オフ）

#### `QRCodeModal.tsx`
- QRコード生成・表示
- クーポン使用時の表示

#### `StampHistory.tsx`
- スタンプ履歴・統計表示
- 総スタンプ数、今月の獲得数
- 直近7日間の履歴

#### `AchievementBadges.tsx`
- 達成バッジ一覧表示
- 獲得状況の表示
- プラチナ会員は中央揃え

#### `LoadingSpinner.tsx`
- ローディング状態の表示

#### `ErrorBoundary.tsx`
- Reactエラーバウンダリー
- エラー時のフォールバックUI

### UIプリミティブ（`components/ui/`）
- `alert.tsx` - アラート表示
- `badge.tsx` - バッジ表示
- `button.tsx` - ボタン
- `card.tsx` - カードコンテナ
- `dialog.tsx` - モーダルダイアログ
- `input.tsx` - 入力フィールド
- `label.tsx` - ラベル
- `progress.tsx` - プログレスバー
- `tabs.tsx` - タブ切り替え

---

## 💾 データ管理・状態管理

### カスタムフック

#### `useSecureStampCard.ts` (localStorage)
- **用途**: 未ログインユーザーのデータ管理
- **保存先**: localStorage (`stampapp:v1`)
- **データ構造**:
  ```typescript
  {
    isAuthenticated: boolean;
    lastStampDate?: string;
    card: { stamps: number; maxStamps: number };
    coupons: Coupon[];
    totalStamps: number;
    stampHistory: Array<{ date: string; count: number }>;
    completedCards: number;
  }
  ```
- **主要関数**:
  - `addStampSecure()` - スタンプ追加
  - `addStampForTest()` - テスト用スタンプ追加
  - `useCoupon()` - クーポン使用
  - `resetCoupons()` - クーポンリセット
  - `resetCard()` - カードリセット

#### `useFirestoreStampCard.ts` (Firestore)
- **用途**: ログインユーザーのデータ管理
- **保存先**: Cloud Firestore (`users/{uid}`)
- **データ構造**: `useSecureStampCard`と同様
- **主要関数**: `useSecureStampCard`と同様のインターフェース

#### `useOfflineSync.ts`
- **用途**: オフライン時のデータ同期
- **機能**:
  - オンライン/オフライン状態の監視
  - オフライン操作のキュー管理
  - オンライン復帰時の自動同期

### 型定義 (`lib/types.ts`)

```typescript
interface StampCard {
  id: string;
  stamps: number;
  maxStamps: number;
  createdAt: Date;
  lastStampAt?: Date;
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  isUsed: boolean;
  createdAt: Date;
  expiresAt: Date;
}

interface StampHistoryEntry {
  date: string; // YYYY-MM-DD
  count: number;
}
```

---

## 🗺 ルーティング

### ルート構成

```typescript
/                    → Index.tsx       (トップページ)
/card                → Card.tsx        (スタンプカードページ)
/register            → Register.tsx    (新規登録)
/login               → Login.tsx       (ログイン)
/*                   → NotFound.tsx    (404)
```

### ルーティングライブラリ
- **React Router DOM 6.26.2**
- **BrowserRouter**を使用（SPA用）

---

## 🔐 認証・データストレージ

### Firebase Authentication
- **認証方式**: Email/Password
- **認証状態管理**: `onAuthStateChanged`でリアルタイム監視
- **ログイン後**: `/card`にリダイレクト
- **ログアウト後**: `/`にリダイレクト

### データストレージ

#### 未ログインユーザー（ゲストモード）
- **ストレージ**: localStorage
- **キー**: `stampapp:v1`
- **特徴**: ブラウザローカルのみ、デバイス間で共有不可

#### ログインユーザー
- **ストレージ**: Cloud Firestore
- **コレクション**: `users`
- **ドキュメントID**: ユーザーUID
- **特徴**: 複数デバイス間で同期可能

### データ同期ロジック
- `Card.tsx`で認証状態を監視
- `firebaseAuth ? firestoreData : localData`で切り替え
- Firestoreは自動でリアルタイム同期
- オフライン時はキューに保存し、接続回復時に同期

---

## 🚀 デプロイメント情報

### ホスティング
- **プラットフォーム**: Vercel
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `dist`
- **ルーティング**: SPA用の`rewrites`設定

### ビルド設定
- **Vite**: 本番ビルド
- **TypeScript**: 型チェック有効
- **Tailwind CSS**: 本番用最適化

### Vercel設定 (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🔧 環境変数設定

### 必要な環境変数

#### Firebase設定（`.env`）
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 環境変数の使用
- **開発環境**: `.env`ファイルから読み込み
- **本番環境**: Vercelの環境変数から読み込み
- **プレフィックス**: `VITE_`で始まる変数のみ公開

---

## 📊 実装済み機能の詳細

### スタンプ獲得ロジック

#### 通常のスタンプ追加 (`addStampSecure`)
1. 1日1回の制限チェック
2. スタンプ数+1（最大10まで）
3. スタンプ履歴に追加
4. **5個目**: ドリンク無料クーポン獲得
5. **10個目**: 10%オフクーポン獲得
6. 累計スタンプ+1
7. **累計が10の倍数**: カードリセット
8. データ保存（Firestore/localStorage）

#### テスト用スタンプ追加 (`addStampForTest`)
- 1日1回の制限を無視
- 複数個まとめて追加可能
- その他は通常追加と同様

### クーポン獲得ロジック

#### ドリンク1杯無料クーポン
- **獲得条件**: スタンプが5個になったとき
- **有効期限**: 獲得日から30日間
- **表示**: スタンプスロット（5個目）に薄く表示

#### 10%オフクーポン
- **獲得条件**: スタンプが10個になったとき
- **有効期限**: 獲得日から30日間
- **表示**: スタンプスロット（10個目）に薄く表示

### カードリセットロジック
- **条件**: 累計スタンプ数が10の倍数になったとき
- **動作**:
  - 現在のスタンプ数を0にリセット
  - `lastStampDate`をクリア
  - 累計スタンプ数はリセットしない（継続）

### スタンプ履歴管理
- **記録**: 日付（YYYY-MM-DD）ごとに獲得数を記録
- **表示**: 直近7日間の履歴を表示
- **統計**: 総スタンプ数、今月の獲得数を計算

### バッジ獲得条件
| バッジ名 | 条件 |
|---------|------|
| 初めてのお客様 | 総スタンプ数 >= 1 |
| ブロンズ会員 | 完成カード数 >= 1 |
| シルバー会員 | 完成カード数 >= 3 |
| ゴールド会員 | 完成カード数 >= 6 |
| プラチナ会員 | 完成カード数 >= 10 |

---

## 🎨 デザイン仕様

### カラーパレット
- **背景**: 白（透明度40%）
- **アクセント**: 茶色系（`#b6902e`など）
- **ボーダー**: `amber-800/60`（2px）
- **テキスト**: `stone-800`, `stone-700`

### 背景画像
- **ファイル**: `5-2-6-3.webp`
- **適用**: `background-attachment: fixed`
- **オーバーレイ**: `bg-stone-900/40`

### レイアウト
- **最大幅**: `max-w-md`（モバイル最適化）
- **グリッド**: スタンプは5列×2行
- **間隔**: `gap-x-3 gap-y-8`

### フォント
- **システムフォント**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`

---

## 📦 静的ファイル（`public/`）

### 画像ファイル
- `5-2-6-3.webp` - 背景画像
- `stamp-filled.png` - 埋まったスタンプ画像
- `stamp-empty.png` - 空のスタンプ画像（交互に使用）
- `ドリンク１杯無料.png` - ドリンク無料クーポン画像
- `10%クーポン.png` - 10%オフクーポン画像
- `favicon.svg` - ファビコン

---

## 🔄 データフロー

### スタンプ追加フロー

```
ユーザー操作
    ↓
handleAddStamp() [Card.tsx]
    ↓
addStampSecure() [useSecureStampCard / useFirestoreStampCard]
    ↓
スタンプ数+1, クーポンチェック, 履歴更新
    ↓
persist() / save() [データ保存]
    ↓
Firestore / localStorage
    ↓
状態更新 → UI反映
    ↓
クーポン獲得時 → モーダル表示
```

### 認証フロー

```
ログイン
    ↓
Firebase Authentication
    ↓
onAuthStateChanged トリガー
    ↓
useFirestoreStampCard でデータ読み込み
    ↓
Firestore からユーザーデータ取得
    ↓
UI更新
```

---

## ⚙️ ビルド・開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# リンター実行
npm run lint

# TypeScript型チェック
npm run typecheck
```

---

## 🐛 既知の制限事項

1. **PWA機能未実装**: `vite-plugin-pwa`はインストール済みだが未設定
2. **QRコードスキャン機能なし**: QRコード生成のみ実装
3. **データエクスポート/インポート機能削除済み**: 以前実装されていたが削除
4. **ランキング機能削除済み**: 以前実装されていたが削除

---

## 🚧 今後の改善案

### 高優先度
1. **PWA対応**
   - manifest.jsonの作成
   - Service Workerの実装
   - オフライン機能の強化
   - ホーム画面追加可能に

2. **統計グラフの可視化**
   - スタンプ獲得の推移グラフ
   - 週間/月間パターンの可視化
   - rechartsなどのライブラリ使用

3. **ソーシャル共有機能**
   - スタンプカード完成時にSNSでシェア
   - Web Share API使用

### 中優先度
4. **音声・バイブレーション通知**
   - スタンプ獲得時の音声
   - クーポン獲得時のバイブレーション

5. **ダークモード対応**
   - システム設定に連動
   - 手動切り替え機能

6. **アクセシビリティ改善**
   - キーボードナビゲーション
   - スクリーンリーダー対応
   - ARIA属性の追加

7. **パフォーマンス最適化**
   - コード分割（lazy loading）
   - 画像の遅延読み込み
   - メモ化の最適化

### 低優先度
8. **ブラウザ通知**
   - クーポン獲得時の通知
   - 期限切れリマインダー

9. **多言語対応**
   - 日本語/英語対応

10. **アニメーション強化**
    - マイクロインタラクション追加

---

## 📝 コード品質

### 型安全性
- ✅ TypeScriptで型定義
- ✅ 主要コンポーネントに型注釈
- ✅ `any`型の使用を最小限に抑制

### エラーハンドリング
- ✅ ErrorBoundaryでReactエラーをキャッチ
- ✅ try-catchで非同期処理を保護
- ✅ トースト通知でエラーメッセージ表示

### パフォーマンス
- ⚠️ ビルドバンドルサイズが大きい（500KB超）
- ✅ React.memoの使用（一部コンポーネント）
- ✅ useCallback/useMemoでメモ化

---

## 🔗 外部サービス連携

### Firebase
- **Authentication**: Email/Password認証
- **Firestore**: ユーザーデータ保存
- **設定ファイル**: `src/lib/firebase.ts`

### Vercel
- **ホスティング**: 静的サイトホスティング
- **CI/CD**: GitHub連携（自動デプロイ）

---

## 📱 レスポンシブデザイン

### 対応デバイス
- **モバイル**: 最適化済み（`max-w-md`）
- **タブレット**: 表示可能
- **デスクトップ**: 表示可能（中央配置）

### ビューポート設定
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

---

## 🔒 セキュリティ

### 実装済み
- ✅ Firebase Authenticationによる認証
- ✅ Firestoreセキュリティルール（要設定）
- ✅ localStorageデータの検証

### 推奨事項
- ⚠️ Firestoreセキュリティルールの設定
- ⚠️ HTTPSの強制（Vercelで自動対応）
- ⚠️ 環境変数の適切な管理

---

## 📈 パフォーマンス指標

### ビルド結果
- **JavaScript**: ~742KB（gzip: ~199KB）
- **CSS**: ~21KB（gzip: ~4.6KB）
- **HTML**: ~0.46KB（gzip: ~0.33KB）

### 最適化の余地
- コード分割（動的インポート）
- 画像最適化
- バンドルサイズの削減

---

## 📚 依存関係の詳細

### 本番依存関係
- `react` / `react-dom`: UIフレームワーク
- `react-router-dom`: ルーティング
- `firebase`: 認証・データベース
- `qrcode.react`: QRコード生成
- `sonner`: トースト通知
- `date-fns`: 日付処理
- `lucide-react`: アイコン

### 開発依存関係
- `vite`: ビルドツール
- `typescript`: 型チェック
- `tailwindcss`: CSSフレームワーク
- `eslint`: リンター
- `vite-plugin-pwa`: PWAプラグイン（未使用）

---

## 🎯 主要な設計判断

### データストレージ
- **理由**: ログイン状態に応じてFirestore/localStorageを切り替え
- **メリット**: ゲストユーザーも即座に利用可能、ログインユーザーは同期可能

### スタイル管理
- **Tailwind CSS**: ユーティリティファーストアプローチ
- **shadcn/ui**: 再利用可能なコンポーネント

### 状態管理
- **React Hooks**: useState, useCallback, useMemo
- **カスタムフック**: ビジネスロジックの分離

### アニメーション
- **CSS Transitions**: 基本的なアニメーション
- **React State**: 複雑なアニメーション

---

## 🔍 デバッグ・開発支援

### 開発ツール
- **React DevTools**: 推奨
- **Firebase Console**: Firestoreデータ確認
- **ブラウザ DevTools**: コンソールログ

### ログ出力
- **コンソールログ**: エラー処理で使用
- **トースト通知**: ユーザー向けメッセージ

---

## 📞 サポート・ドキュメント

### 参考ドキュメント
- `README.md`: 基本的な説明
- `FIREBASE_SETUP.md`: Firebase設定ガイド
- このドキュメント: プロジェクト現状まとめ

### 設定ファイル
- `vite.config.ts`: ビルド設定
- `tailwind.config.js`: Tailwind設定
- `tsconfig.json`: TypeScript設定

---

## ✅ チェックリスト

### 実装済み機能
- [x] スタンプカード表示
- [x] スタンプ獲得機能
- [x] クーポンシステム（2種類）
- [x] 自動カードリセット
- [x] スタンプ履歴・統計
- [x] 達成バッジシステム
- [x] Firebase認証
- [x] Firestore連携
- [x] オフライン対応
- [x] エラーハンドリング
- [x] ローディング状態
- [x] QRコード生成

### 未実装機能
- [ ] PWA対応
- [ ] データエクスポート/インポート（削除済み）
- [ ] ランキング機能（削除済み）
- [ ] 統計グラフ
- [ ] ソーシャル共有
- [ ] 音声・バイブレーション通知
- [ ] ダークモード
- [ ] 多言語対応

---

## 🎉 まとめ

**LotusCard**は、モダンな技術スタックで構築されたスタンプカードWebアプリケーションです。Firebase認証とFirestore連携により、複数デバイス間でのデータ同期が可能で、オフライン時も動作します。シンプルで使いやすいUIと、アニメーションを活用したUXにより、楽しいスタンプカード体験を提供しています。

**現在の状態**: 基本的な機能は全て実装済み。PWA対応、統計グラフ、共有機能などの追加機能で、さらなる価値向上が可能です。

---

**最終更新**: 2024年
**ドキュメントバージョン**: 1.0

