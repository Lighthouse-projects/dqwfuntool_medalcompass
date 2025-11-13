# dqwfunメダルコンパス (MedalCompass)

ドラクエウォークの小さなメダルの湧き位置を登録・共有できるReact Nativeモバイルアプリ。

## プロジェクト概要

- **技術スタック**: React Native + Expo, Supabase PostgreSQL + RLS, TypeScript
- **対象プラットフォーム**: iOS/Androidモバイルアプリ
- **想定ユーザー数**: 約1,000人
- **開発体制**: 個人開発プロジェクト

## 実装状況

### ✅ 完了した機能

- **F001: ユーザー認証・登録機能**
  - ログイン画面
  - 新規登録画面
  - パスワードリセット画面
  - 認証状態管理（AuthContext）
  - セッション復元機能

- **F002: メダル登録機能**
  - GPS座標取得
  - 5メートル重複チェック
  - 測位精度警告（20m閾値）
  - メダル登録API

- **F003: メダル表示機能**
  - react-native-mapsによるマップ表示
  - 自分のメダル（銀色）と他人のメダル（黄色）の色分け表示
  - 周辺5km以内のメダル取得
  - アプリ起動時に現在地を中心に表示
  - 手動メダル再読み込み機能

- **F004: メダル削除機能**
  - 自分のメダルをタップして削除
  - 削除確認ダイアログ
  - マップから即座に削除

- **F005: マップ操作機能**
  - ピンチイン/ピンチアウトでズーム
  - スワイプでマップ移動
  - 現在地ボタン（MaterialIcons）

- **F006: 誤メダル通報機能**
  - 他人のメダルの通報
  - 通報数表示（3件以上の場合）
  - 5通報以上でメダル無効化
  - 10通報以上でユーザーBAN
  - 重複通報防止（UNIQUE制約）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、Supabaseの設定を記載してください。

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 開発サーバーの起動

```bash
npm start
```

### 4. アプリの実行

- **iOSシミュレーター**: `npm run ios`
- **Androidエミュレーター**: `npm run android`
- **Web**: `npm run web`

## プロジェクト構造

```
src/
├── screens/          # 画面コンポーネント
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── PasswordResetScreen.tsx
│   └── MapScreen.tsx
├── contexts/         # React Context
│   └── AuthContext.tsx
├── components/       # 共通コンポーネント
│   ├── common/
│   │   ├── Button.tsx
│   │   └── TextInput.tsx
│   └── auth/
├── navigation/       # ナビゲーション設定
│   └── index.tsx
├── utils/            # ユーティリティ関数
│   └── validation.ts
├── types/            # 型定義
│   └── auth.ts
└── lib/              # ライブラリ初期化
    └── supabase.ts
```

## ドキュメント

詳細な設計書は`documents/`フォルダを参照してください。

- [要件定義書](documents/1_要件定義書.md)
- [アーキテクチャ設計書](documents/2_アーキテクチャ設計書.md)
- [機能設計書](documents/3_機能設計書.md)
- [データベース設計書](documents/4_データベース設計書.md)
- [データベース作成SQL](documents/4_データベース設計書_DDL.md)
- [UI設計書](documents/7_UI設計書.md)

## ライセンス

個人開発プロジェクト
