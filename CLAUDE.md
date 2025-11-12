# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要なルール

**⚠️ COMMITとPUSHは勝手にしないこと**
- ファイルの変更後、必ずユーザーに確認を求めること
- ユーザーが明示的に「コミットして」「プッシュして」と指示した場合のみ実行すること
- 自動でのgit操作は禁止

## プロジェクト概要

**MedalCompass (dqwfunメダルコンパス)** は、ドラクエウォークのプレイヤーが小さなメダルの湧き位置を登録・共有できるReact Nativeモバイルアプリです。ユーザーは現在位置でボタンをクリックしてメダル位置を登録でき、登録された位置は全ユーザーがマップ上で閲覧できます。

- **対象プラットフォーム**: iOS/Androidモバイルアプリ
- **技術スタック**: React Native + Expo, Supabase PostgreSQL + RLS, TypeScript
- **想定ユーザー数**: 約1,000人
- **開発体制**: 個人開発プロジェクト
- **言語**: 日本語
- **開発状況**: 設計フェーズ（実装前）

## 現在の開発状況

このプロジェクトは**設計フェーズ**です。以下のドキュメントが完成しており、実装はまだ開始していません：

1. [要件定義書](documents/1_要件定義書.md) - 機能要件、非機能要件
2. [アーキテクチャ設計書](documents/2_アーキテクチャ設計書.md) - 技術スタック、システム構成
3. [機能設計書](documents/3_機能設計書.md) - 画面設計、機能仕様
4. [データベース設計書](documents/4_データベース設計書.md) - テーブル定義、RLSポリシー

**実装を開始する前に、必ずこれらの設計書を参照してください。**

## 開発コマンド（実装後に使用予定）

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
```

### 本番ビルド
```bash
# EAS BuildでAndroidビルド
eas build --platform android

# EAS BuildでiOSビルド
eas build --platform ios

# 両プラットフォームをビルド
eas build --platform all
```

## アーキテクチャ概要

### システムアーキテクチャの重要な設計変更

**⚠️ Edge Functionsは使用しない（B案を採用）**

当初はEdge Functions経由でデータ操作を行う設計（A案）でしたが、コスト削減とシンプル化のため**B案（RLS + クライアント直接アクセス）**を採用しました。

### 採用アーキテクチャ（B案）の特徴

1. **データ読み取り**: クライアントからPostgreSQLへ直接SELECT（全員閲覧可能）
2. **データ書き込み**: クライアントから直接INSERT、RLSで`auth.uid() = user_id`を検証
3. **データ削除**: クライアントから直接DELETE、RLSで`auth.uid() = user_id`を検証
4. **5メートル重複チェック**: クライアント側でHaversine距離計算
5. **誤メダル通報**: クライアントから直接medal_reportsテーブルへINSERT、RLSで認証制御

### フロントエンドアーキテクチャ（予定）
- **フレームワーク**: React Native + Expo
- **状態管理**: React Context API
  - `AuthContext` - ユーザー認証状態の管理
- **型安全性**: TypeScript全体で使用

### バックエンドアーキテクチャ
- **プラットフォーム**: Supabase (Backend-as-a-Service)
- **データベース**: PostgreSQL (Row Level Security有効)
- **認証**: Supabase Auth (JWTトークン)
- **Edge Functions**: **使用しない**（コスト$0/月を実現）
- **Realtime**: **使用しない**（シンプル化のため）

### データベーススキーマ

**1. medalsテーブル** (publicスキーマ):
- `id` (uuid, 主キー)
- `user_id` (uuid, auth.usersへの外部キー)
- `latitude` (decimal(10,8), NOT NULL) - 緯度
- `longitude` (decimal(11,8), NOT NULL) - 経度
- `is_deleted` (boolean, NOT NULL, DEFAULT false) - 削除フラグ（5通報以上でtrue）
- `deleted_at` (timestamptz, NULL) - 削除日時
- `created_at` (timestamptz, NOT NULL) - 作成日時
- `updated_at` (timestamptz, NOT NULL) - 更新日時

**2. medal_reportsテーブル** (publicスキーマ):
- `id` (uuid, 主キー)
- `medal_id` (uuid, medalsへの外部キー)
- `reporter_user_id` (uuid, auth.usersへの外部キー)
- `created_at` (timestamptz, NOT NULL) - 通報日時
- UNIQUE制約: (medal_id, reporter_user_id) - 重複通報防止

**Row Level Security (RLS) ポリシー**:
- **medals SELECT**: 全員が閲覧可能（`USING (true)`）
- **medals INSERT**: 認証済みユーザーのみ、`auth.uid() = user_id`で検証
- **medals DELETE**: 認証済みユーザーは自分のメダルのみ削除可能
- **medals UPDATE**: is_deletedとdeleted_atの更新のみ許可（通報処理用）
- **medal_reports SELECT**: 全員が閲覧可能
- **medal_reports INSERT**: 認証済みユーザーのみ、`auth.uid() = reporter_user_id`で検証
- **medal_reports DELETE/UPDATE**: 不可（通報は取り消し不可）

**重要な制約・ロジック**:
- 既存メダルの5メートル以内に重複登録不可（クライアント側でチェック）
- 5通報でメダル無効化（is_deleted = true）
- 10通報でユーザーBAN（ユーザーの全メダルをis_deleted = true）

## セキュリティアーキテクチャ

### 認証フロー
- **メールアドレス/パスワード認証**: Supabase Auth（JWTトークン）
- **RLS自動認証**: `auth.uid()`関数でJWTトークンから自動的にユーザーIDを取得・検証

### データ保護
- **データベース**: PostgreSQLレベルでRow Level Security (RLS)を適用
- **クライアント直接アクセス**: RLSにより安全に直接データベースアクセス可能
- **通信**: 全トラフィックをHTTPS/TLSで暗号化
- **トークン保存**: Expo SecureStore (iOS Keychain / Android Keystore)

### 重要なセキュリティ注意事項
- **悪意あるユーザーは他人のuser_idでデータ登録できない**: RLSが`auth.uid() = user_id`を自動検証
- **通報の取り消しは不可**: 通報履歴は削除・更新不可（監査証跡）
- **メールアドレス以外の個人情報は保存しない**
- **メダル位置情報は公開オープンデータ**

## 主要機能とビジネスロジック

### メダル登録ロジック（F001）
1. ユーザーが「登録」ボタンをタップ
2. アプリが現在のGPS座標を取得
3. **クライアント側で5メートル重複チェック**:
   - 周辺メダルを取得: `.eq('is_deleted', false)`で有効なメダルのみ
   - Haversine距離計算で5メートル以内のメダルが存在するかチェック
   - Yes → エラー表示、登録を防止
   - No → ステップ4へ進む
4. **クライアントから直接INSERT**:
   ```typescript
   await supabase.from('medals').insert([{
     user_id: supabase.auth.user().id,
     latitude: newLatitude,
     longitude: newLongitude
   }])
   ```
5. **RLSが自動検証**: `auth.uid() = user_id`をチェック、不正なuser_idは自動拒否

### メダル表示ロジック（F003）
- **全ユーザーのメダルをマップ上に表示**: `.eq('is_deleted', false)`で有効なメダルのみ表示
- **自分のメダルは銀色、他人のメダルは黄色で表示**
- **自分のメダルをタップ**: 削除ボタンと通報数を表示
- **他人のメダルをタップ**: 「誤メダルとして通報」ボタンと通報数を表示

### 誤メダル通報ロジック（F006）
1. ユーザーが他人のメダル（黄色）をタップ
2. 「誤メダルとして通報」ボタンをタップ
3. 確認ダイアログ表示
4. **クライアントから直接INSERT**:
   ```typescript
   await supabase.from('medal_reports').insert([{
     medal_id: targetMedalId,
     reporter_user_id: supabase.auth.user().id
   }])
   ```
5. **UNIQUE制約により重複通報を自動防止**
6. 通報数をカウント、5通報以上なら`medals.is_deleted = true`に更新
7. ユーザーの通報受信数をカウント、10通報以上ならユーザーの全メダルを`is_deleted = true`に更新

### パフォーマンス最適化
- **is_deletedインデックス**: マップ表示時に`.eq('is_deleted', false)`で高速フィルタリング
- **地理座標インデックス**: `idx_medals_location`で範囲検索を高速化
- **通報数の動的カウント不要**: is_deletedフラグにより、毎回通報数をカウントする必要なし

## 開発ガイドライン

### Supabaseクライアント利用パターン
- **認証が必要な操作の前には必ず`supabase.auth.user()`をチェック**
- **全てのSELECTクエリに`.eq('is_deleted', false)`を追加**（削除済みメダルを除外）
- **RLSを信頼する**: クライアント側でuser_idチェックは不要、RLSが自動検証

### エラーハンドリング
- ユーザーフレンドリーな**日本語エラーメッセージ**を表示
- デバッグ用にコンソールへエラーをログ出力
- ネットワーク障害を適切に処理

### 位置情報パーミッション
- 初回使用時に位置情報パーミッションをリクエスト
- なぜ位置情報が必要かを説明（日本語テキスト）
- パーミッション拒否を適切に処理

## 環境変数

`.env`または`.env.local`に必要な環境変数:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## デプロイ（実装後）

### iOSデプロイ
- Apple Developer Program必須($99/年)
- EAS Buildを使用: `eas build --platform ios`

### Androidデプロイ
- Google Play Developer必須($25 一度のみ)
- EAS Buildを使用: `eas build --platform android`

### データベースセットアップ
1. Supabaseプロジェクトを作成
2. [documents/4_データベース設計書.md](documents/4_データベース設計書.md)のSQLを実行:
   - medalsテーブル作成
   - medal_reportsテーブル作成
   - インデックス作成
   - RLSポリシー設定

## コスト構造

### 初期コスト
- Apple Developer Program: $99
- Google Play Developer: $25
- **合計**: $124

### 月額ランニングコスト
- Supabase: **$0/月**（無料プラン、1,000ユーザー規模で十分）
- **合計**: $0/月

## ドキュメント参照

全てのドキュメントは日本語で記載されています：

1. **[要件定義書](documents/1_要件定義書.md)** - 機能要件、非機能要件、不正データ対策
2. **[アーキテクチャ設計書](documents/2_アーキテクチャ設計書.md)** - 技術スタック、システム構成図、B案採用理由
3. **[機能設計書](documents/3_機能設計書.md)** - 画面仕様、機能フロー、用語集
4. **[データベース設計書](documents/4_データベース設計書.md)** - テーブル定義、RLSポリシー、データアクセスパターン

**実装を開始する前に、必ずこれらの設計書を参照してください。**

## 重要な実装ノート

### UI/UX優先事項
- 大きなボタン（歩きながら使用するアプリ）
- マップ中心のインターフェース（最小限のUI要素）
- シンプルで直感的なワンボタン登録
- **自分のメダルは銀色、他人のメダルは黄色で表示**

### パフォーマンス目標
- アプリ起動時間: 3秒以内
- 1,000人の同時ユーザーをサポート

### 実装対象外（スコープ外）
- メダルへのテキスト/コメント（スパム/モデレーション問題を防ぐため）
- チャットやソーシャル機能
- リアルタイム更新（Supabase Realtime）
- 生体認証（Face ID/Touch ID）
- アナリティクスやユーザートラッキング
- GDPR対応（当初は日本国内のみ）
- 高度なアクセシビリティ機能
- デスクトップ/Web版
