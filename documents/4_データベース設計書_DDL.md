# データベース作成SQL (DDL)

このドキュメントは、MedalCompass（dqwfunメダルコンパス）のSupabase PostgreSQLデータベースを作成するためのDDL（Data Definition Language）を記載しています。

詳細なデータベース設計については、[4_データベース設計書.md](4_データベース設計書.md)を参照してください。

---

## テーブル作成

### medals テーブル

```sql
CREATE TABLE medals (
  medal_no bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,  -- メダル番号（連番）
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- 登録ユーザーID
  latitude decimal(10, 8) NOT NULL,  -- 緯度（-90～90）
  longitude decimal(11, 8) NOT NULL,  -- 経度（-180～180）
  is_deleted boolean NOT NULL DEFAULT false,  -- 削除フラグ（5通報以上でtrue）
  deleted_at timestamptz NULL,  -- 削除日時
  created_at timestamptz NOT NULL DEFAULT now(),  -- 登録日時
  updated_at timestamptz NOT NULL DEFAULT now(),  -- 最終更新日時
  CONSTRAINT check_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT check_longitude CHECK (longitude >= -180 AND longitude <= 180)
);
```

### medal_reports テーブル

```sql
CREATE TABLE medal_reports (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,  -- 通報ID（連番）
  medal_no bigint NOT NULL REFERENCES medals(medal_no) ON DELETE CASCADE,  -- 通報対象のメダル番号
  reporter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- 通報したユーザーID
  created_at timestamptz NOT NULL DEFAULT now(),  -- 通報日時
  CONSTRAINT unique_medal_reporter UNIQUE (medal_no, reporter_user_id)  -- 重複通報防止
);
```

---

## インデックス作成

### medals テーブルのインデックス

```sql
CREATE INDEX idx_medals_location ON medals (latitude, longitude);  -- 地理座標検索用
CREATE INDEX idx_medals_user_id ON medals (user_id);  -- ユーザーID検索用
CREATE INDEX idx_medals_is_deleted ON medals (is_deleted);  -- 削除フラグ検索用
CREATE INDEX idx_medals_created_at ON medals (created_at);  -- 作成日時検索用
```

### medal_reports テーブルのインデックス

```sql
CREATE UNIQUE INDEX idx_medal_reports_unique ON medal_reports (medal_no, reporter_user_id);  -- 重複通報防止
CREATE INDEX idx_medal_reports_medal_no ON medal_reports (medal_no);  -- 通報数カウント用
CREATE INDEX idx_medal_reports_reporter ON medal_reports (reporter_user_id);  -- 通報履歴用
```

---

## Row Level Security (RLS) ポリシー設定

### medals テーブルのRLSポリシー

```sql
ALTER TABLE medals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medals are viewable by everyone" ON medals FOR SELECT USING (true);  -- 全員閲覧可能
CREATE POLICY "Users can insert their own medals" ON medals FOR INSERT WITH CHECK (auth.uid() = user_id);  -- 自分のuser_idでのみ登録可能
CREATE POLICY "Users can delete their own medals" ON medals FOR DELETE USING (auth.uid() = user_id);  -- 自分のメダルのみ削除可能
CREATE POLICY "Allow is_deleted updates" ON medals FOR UPDATE USING (true) WITH CHECK (true);  -- is_deleted更新を許可（通報処理用）
```

### medal_reports テーブルのRLSポリシー

```sql
ALTER TABLE medal_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports are viewable by everyone" ON medal_reports FOR SELECT USING (true);  -- 全員閲覧可能
CREATE POLICY "Users can insert their own reports" ON medal_reports FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);  -- 自分のreporter_user_idでのみ通報可能
CREATE POLICY "Reports cannot be deleted" ON medal_reports FOR DELETE USING (false);  -- 削除不可
CREATE POLICY "Reports cannot be updated" ON medal_reports FOR UPDATE USING (false);  -- 更新不可
```

---

## 実行順序

Supabaseプロジェクトでデータベースをセットアップする際は、以下の順序でSQLを実行してください：

1. **テーブル作成**: medalsテーブル → medal_reportsテーブル
2. **インデックス作成**: medals用インデックス → medal_reports用インデックス
3. **RLSポリシー設定**: medals用ポリシー → medal_reports用ポリシー

すべてのSQLを順番に実行することで、データベースが正しくセットアップされます。

---

## まとめ

このDDLを実行することで、MedalCompassに必要な以下のデータベース構造が作成されます：

- ✅ medalsテーブル（メダル位置情報）
- ✅ medal_reportsテーブル（誤メダル通報履歴）
- ✅ 適切なインデックス（パフォーマンス最適化）
- ✅ Row Level Security（セキュリティ保護）

詳細な設計思想やテーブル定義の説明については、[4_データベース設計書.md](4_データベース設計書.md)を参照してください。
