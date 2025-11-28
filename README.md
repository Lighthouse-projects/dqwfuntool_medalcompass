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

## 内部テスター向け配布（Expo Development Build）

### 前提条件

1. **Expoアカウント作成**: [https://expo.dev](https://expo.dev) でアカウント作成
2. **EAS CLIインストール**: `npm install -g eas-cli`
3. **Expoログイン**: `eas login`

### ビルド作成手順

#### Androidビルド（APK）

```bash
# 開発ビルドを作成
eas build --profile development --platform android

# ビルド完了後、ダウンロードURLが表示されます
# テスターにURLを共有してAPKをインストールしてもらう
```

#### iOSビルド（要Apple Developer Program）

```bash
# 開発ビルドを作成
eas build --profile development --platform ios

# Ad Hoc配布用：デバイスUDIDを事前に登録する必要があります
# TestFlight配布用：Apple Developer Programが必要です
```

### テスターへの配布方法

1. **Androidの場合**:
   - ビルド完了後に表示されるURLをテスターに共有
   - テスターは直接APKをダウンロード・インストール
   - 提供元不明のアプリのインストールを許可する必要あり

2. **iOSの場合（Ad Hoc）**:
   - テスターのデバイスUDIDを収集
   - Apple Developer Portalでデバイス登録
   - ビルド後、TestFlightまたはAd Hoc配布

### 開発ビルドの実行

テスターがアプリをインストール後：

1. **Expo Goアプリは不要**: Development Buildは独立したアプリとして動作
2. **開発サーバーとの接続**:
   ```bash
   # 開発者側で開発サーバーを起動
   npm start

   # テスターは表示されたQRコードをスキャン、または
   # exp://あなたのIPアドレス:8081 に接続
   ```
3. **本番環境のテスト**: 開発サーバーなしでもSupabaseに直接接続可能

### ビルドプロファイル（eas.json）

- **development**: 開発ビルド、内部テスト用
- **preview**: プレビュービルド、内部テスト用
- **production**: 本番リリース用（App Store/Google Play）

## ドキュメント

詳細な設計書は`documents/`フォルダを参照してください。

- [要件定義書](documents/1_要件定義書.md)
- [UI要件書](documents/2_UI要件書.md)
- [機能設計書](documents/3_機能設計書.md)
- [アーキテクチャ設計書](documents/4_アーキテクチャ設計書.md)
- [データベース設計書](documents/5_データベース設計書.md)
- [利用規約](documents/6_利用規約.md)
- [プライバシーポリシー](documents/7_プライバシーポリシー.md)

## ライセンス

個人開発プロジェクト
