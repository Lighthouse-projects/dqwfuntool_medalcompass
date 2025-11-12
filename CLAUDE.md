# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**MedalCompass (dqwfunメダルコンパス)** は、ドラクエウォークのプレイヤーが小さなメダルの湧き位置を登録・共有できるReact Nativeモバイルアプリです。ユーザーは現在位置でボタンをクリックしてメダル位置を登録でき、登録された位置は全ユーザーがマップ上で閲覧できます。

- **対象プラットフォーム**: iOS/Androidモバイルアプリ
- **技術スタック**: React Native + Expo, Supabase (PostgreSQL + Edge Functions), TypeScript
- **想定ユーザー数**: 約1,000人
- **開発体制**: 個人開発プロジェクト
- **言語**: 日本語

## 開発コマンド

### セットアップとインストール
```bash
# 依存関係のインストール
npm install

# Expo開発サーバーの起動
npm start

# iOSシミュレーターで実行
npm run ios

# Androidエミュレーターで実行
npm run android

# Web版で実行(テスト用)
npm run web
```

### 本番ビルド
```bash
# EAS BuildでAndroidビルド
npm run build:android
# または: eas build --platform android

# EAS BuildでiOSビルド
npm run build:ios
# または: eas build --platform ios

# 両プラットフォームをビルド
eas build --platform all
```

### テスト
```bash
# テストの実行(実装後)
npm test

# ウォッチモードでテスト実行
npm test -- --watch
```

### Supabase Edge Functions
```bash
# 全Edge Functionsをデプロイ
supabase functions deploy

# 特定の関数をデプロイ
supabase functions deploy registerMedal

# ローカルで関数をテスト
supabase functions serve
```

## アーキテクチャ概要

### フロントエンドアーキテクチャ
- **フレームワーク**: React Native + Expo
- **ナビゲーション**: Expo Router (ファイルベースルーティング)
- **状態管理**: React Context API
  - `AuthContext` - ユーザー認証状態の管理
  - `UnreadContext` - 通知/未読状態の管理
- **型安全性**: TypeScript全体で使用

### バックエンドアーキテクチャ
- **プラットフォーム**: Supabase (Backend-as-a-Service)
- **データベース**: PostgreSQL (Row Level Security有効)
- **APIレイヤー**: Supabase Edge Functions (Denoランタイム)
- **認証**: Supabase Auth (JWTトークン)
- **リアルタイム更新**: Supabase Realtime (WebSocketベース)

### 主要コンポーネント構造
```
src/
├── components/       # 再利用可能なUIコンポーネント
│   ├── MapComponent.tsx      # メインマップ表示
│   ├── MedalMarker.tsx       # メダル位置マーカー
│   └── AuthComponents/       # ログイン/サインアップフォーム
├── screens/          # 画面レベルのコンポーネント
│   ├── LoginScreen.tsx       # ログイン画面
│   ├── MapScreen.tsx         # マップ画面
│   └── SettingsScreen.tsx    # 設定画面
├── context/          # React Contextプロバイダー
│   ├── AuthContext.tsx       # 認証管理
│   └── UnreadContext.tsx     # 未読管理
├── services/         # 外部サービス連携
│   ├── supabaseClient.ts     # Supabaseクライアント設定
│   ├── authService.ts        # 認証操作
│   └── medalService.ts       # メダルCRUD操作
├── hooks/            # カスタムReactフック
│   ├── useBiometric.ts       # 生体認証フック
│   └── useLocation.ts        # 位置情報フック
├── utils/            # ユーティリティ関数
└── types/            # TypeScript型定義

supabase/
├── functions/        # Edge Functions (Deno)
│   ├── registerMedal/        # メダル新規登録
│   ├── deleteMedal/          # メダル削除
│   └── validateMedal/        # メダルデータ検証
└── migrations/       # データベースマイグレーション
    └── 001_init_schema.sql
```

### データベーススキーマ

**medalsテーブル** (publicスキーマ):
- `id` (uuid, 主キー)
- `user_id` (uuid, auth.usersへの外部キー)
- `latitude` (decimal, NOT NULL) - 緯度
- `longitude` (decimal, NOT NULL) - 経度
- `created_at` (timestamp) - 作成日時
- `updated_at` (timestamp) - 更新日時

**Row Level Security (RLS) ポリシー**:
- 読み取りアクセス: 全員が全メダルを閲覧可能
- 書き込みアクセス: 認証済みユーザーのみメダル登録可能(Edge Functions経由)
- 削除アクセス: ユーザーは自分のメダルのみ削除可能

**重要な制約**: 既存メダルの5メートル以内に重複登録不可。

## セキュリティアーキテクチャ

### 認証フロー
1. **メールアドレス/パスワード認証**: 従来のSupabase Auth
2. **生体認証** (オプション): Face ID/Touch ID (`expo-local-authentication`使用)
   - トークンはデバイスのセキュアストレージに保存(Keychain/Keystore)
   - デバイスバインディングで追加のセキュリティ
   - トークン有効期限30日
   - 生体認証失敗時はメールアドレス/パスワードでフォールバック

### データ保護
- **データベース**: PostgreSQLレベルでRow Level Security (RLS)を適用
- **API**: 全ての書き込み操作は認証済みEdge Functions経由
- **クライアント**: パフォーマンスのためpublicスキーマへ直接読み取りアクセス
- **通信**: 全トラフィックをHTTPS/TLSで暗号化
- **トークン保存**: Expo SecureStore (iOS Keychain / Android Keystore)

### 重要なセキュリティ注意事項
- データ登録/削除は必ずEdge Functions経由で実行(認証必須)
- データ読み取りはクライアントからSupabaseへ直接アクセス(パフォーマンス最適化)
- メールアドレス以外の個人情報は保存しない
- メダル位置情報は公開オープンデータ

## 主要機能とビジネスロジック

### メダル登録ロジック
1. ユーザーが「登録」ボタンをタップ
2. アプリが現在のGPS座標を取得
3. チェック: 5メートル以内にメダルが存在するか?
   - Yes → エラー表示、登録を防止
   - No → ステップ4へ進む
4. 座標とuser_idを含むEdge Functionを呼び出し
5. Edge Functionで認証検証後、データベースへ挿入
6. リアルタイム更新で全接続クライアントへ新規メダルをブロードキャスト

### メダル表示ロジック
- 全ユーザーのメダルをマップ上に表示
- 自分のメダルは異なる色で表示
- 自分のメダルをクリックすると削除ボタンを表示
- 他ユーザーのメダルをクリックすると読み取り専用の情報を表示

### 位置情報
- 5メートルの重複排除半径でスパムを防止
- `latitude`と`longitude`のインデックス付きカラムで高速クエリ
- パフォーマンスのため地理インデックス(`idx_medals_location`)を使用

## 開発ガイドライン

### 状態管理パターン
- グローバル状態(認証、通知)にはReact Contextを使用
- UI専用の状態にはローカルコンポーネント状態を使用
- 状態は最小限に保ち、使用場所の近くに配置

### 認証パターン
- 認証が必要な操作の前には必ず`AuthContext`をチェック
- トークン期限切れはリフレッシュメカニズムで適切に処理
- 生体認証失敗時のフォールバックを提供

### エラーハンドリング
- ユーザーフレンドリーな日本語エラーメッセージを表示
- デバッグ用にコンソールへエラーをログ出力
- ネットワーク障害を適切に処理(初期段階ではオフライン対応不要)

### Supabase Edge Functions
- TypeScriptで関数を記述(Denoネイティブ)
- `supabaseClient.auth.getUser()`を使用して常にJWTトークンを検証
- 適切なHTTPステータスコードを返す(200, 400, 401, 500)
- 関数は集中的で単一目的に保つ

### 位置情報パーミッション
- 初回使用時に位置情報パーミッションをリクエスト
- なぜ位置情報が必要かを説明(日本語テキスト)
- パーミッション拒否を適切に処理

## 環境変数

`.env`または`.env.local`に必要な環境変数:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Edge Functions用(Supabaseダッシュボードに保存):
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 生体認証の実装

### ステータス
- コード実装済みだが実機でのテスト未実施
- iOSテストにはApple Developer Accountが必要
- Expo Goではテスト不可(Development BuildまたはEAS Buildが必要)

### 実装詳細
- **ライブラリ**: `expo-local-authentication`
- **ストレージ**: `expo-secure-store`
- **プラットフォームサポート**: iOS (Face ID/Touch ID), Android (BiometricPrompt)
- **トークン有効期限**: 30日
- **フォールバック**: 生体認証失敗時はメールアドレス/パスワードログイン
- **セキュリティ**: デバイスバインディング、5回失敗で自動ロックアウト

### 生体認証機能のテスト方法
1. EAS BuildまたはDevelopment Buildでビルド(Expo Goは動作しない)
2. 実機にインストール
3. デバイスに生体認証が登録されていることを確認
4. 認証フローとフォールバックメカニズムをテスト

## デプロイ

### iOSデプロイ
- Apple Developer Program必須($99/年)
- EAS Buildを使用: `eas build --platform ios`
- EAS SubmitまたはApp Store Connectから手動でApp Storeへ申請

### Androidデプロイ
- Google Play Developer必須($25 一度のみ)
- EAS Buildを使用: `eas build --platform android`
- EAS SubmitまたはGoogle Play Consoleから手動でGoogle Playへ申請

### バックエンドデプロイ
- Supabase Edge Functions: `supabase functions deploy`
- データベースマイグレーション: `supabase db push`
- サーバー管理不要(完全マネージド)

## コスト構造

### 初期コスト
- Apple Developer Program: $99
- Google Play Developer: $25
- ドメイン取得: $15
- **合計**: $139

### 月額ランニングコスト
- Supabase Pro: $25
- Google Cloud Storage: $3
- Cloud CDN: $2
- Vision API: $8
- ドメイン: $1
- **合計**: $39/月 ($468/年)

## ドキュメント参照

全てのドキュメントは日本語:
- [documents/1_要件定義書.md](documents/1_要件定義書.md) - 要件仕様書
- [documents/2_アーキテクチャ設計書.md](documents/2_アーキテクチャ設計書.md) - アーキテクチャ設計書

## 重要な実装ノート

### UI/UX優先事項
- 大きなボタン(歩きながら使用するアプリ)
- マップ中心のインターフェース(最小限のUI要素)
- シンプルで直感的なワンボタン登録
- 自分のメダルと他人のメダルを異なる色で表示

### パフォーマンス目標
- アプリ起動時間: 3秒以内
- 生体認証プロンプト表示: 500ms以内
- 1,000人の同時ユーザーをサポート

### 実装対象外(スコープ外)
- メダルへのテキスト/コメント(スパム/モデレーション問題を防ぐため)
- チャットやソーシャル機能
- アナリティクスやユーザートラッキング
- GDPR対応(当初は日本国内のみ)
- 高度なアクセシビリティ機能
- デスクトップ/Web版
