# データベース作成SQL (DDL)

このドキュメントは、MedalCompass（dqwfunメダルコンパス）のSupabase PostgreSQLデータベースを作成するためのDDL（Data Definition Language）を記載しています。

詳細なデータベース設計については、[4_データベース設計書.md](4_データベース設計書.md)を参照してください。

---

## 1. medals テーブル

```sql
-- テーブル作成
CREATE TABLE medals (
  medal_no bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT check_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT check_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- インデックス作成
CREATE INDEX idx_medals_location ON medals (latitude, longitude);
CREATE INDEX idx_medals_user_id ON medals (user_id);
CREATE INDEX idx_medals_is_deleted ON medals (is_deleted);
CREATE INDEX idx_medals_created_at ON medals (created_at);

-- RLSポリシー設定
ALTER TABLE medals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medals are viewable by everyone" ON medals FOR SELECT USING (true);
CREATE POLICY "Users can insert their own medals" ON medals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own medals" ON medals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow is_deleted updates" ON medals FOR UPDATE USING (true) WITH CHECK (true);
```

---

## 2. medal_reports テーブル

```sql
-- テーブル作成
CREATE TABLE medal_reports (
  report_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  medal_no bigint NOT NULL REFERENCES medals(medal_no) ON DELETE CASCADE,
  reporter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_medal_reporter UNIQUE (medal_no, reporter_user_id)
);

-- インデックス作成
CREATE UNIQUE INDEX idx_medal_reports_unique ON medal_reports (medal_no, reporter_user_id);
CREATE INDEX idx_medal_reports_medal_no ON medal_reports (medal_no);
CREATE INDEX idx_medal_reports_reporter ON medal_reports (reporter_user_id);

-- RLSポリシー設定
ALTER TABLE medal_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports are viewable by everyone" ON medal_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reports" ON medal_reports FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "Reports cannot be deleted" ON medal_reports FOR DELETE USING (false);
CREATE POLICY "Reports cannot be updated" ON medal_reports FOR UPDATE USING (false);
```

---

## 3. medal_collections テーブル

```sql
-- テーブル作成
CREATE TABLE medal_collections (
  collection_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medal_no bigint NOT NULL REFERENCES medals(medal_no) ON DELETE CASCADE,
  collected_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_medal UNIQUE (user_id, medal_no)
);

-- インデックス作成
CREATE UNIQUE INDEX idx_medal_collections_unique ON medal_collections (user_id, medal_no);
CREATE INDEX idx_medal_collections_user_id ON medal_collections (user_id);
CREATE INDEX idx_medal_collections_medal_no ON medal_collections (medal_no);

-- RLSポリシー設定
ALTER TABLE medal_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections are viewable by everyone" ON medal_collections FOR SELECT USING (true);
CREATE POLICY "Users can insert their own collections" ON medal_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collections" ON medal_collections FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Collections cannot be updated" ON medal_collections FOR UPDATE USING (false);
```

---

## 実行方法

Supabaseプロジェクトでデータベースをセットアップする際は、上記の各テーブルのSQLブロックを順番にコピー&ペーストして実行してください。

1. medals テーブルのSQLブロック全体をコピペして実行
2. medal_reports テーブルのSQLブロック全体をコピペして実行
3. medal_collections テーブルのSQLブロック全体をコピペして実行

各SQLブロックには、テーブル作成・インデックス作成・RLSポリシー設定がすべて含まれています。

---

## まとめ

このDDLを実行することで、MedalCompassに必要な以下のデータベース構造が作成されます：

- ✅ medalsテーブル（メダル位置情報）
- ✅ medal_reportsテーブル（誤メダル通報履歴）
- ✅ medal_collectionsテーブル（メダル獲得履歴）
- ✅ 適切なインデックス（パフォーマンス最適化）
- ✅ Row Level Security（セキュリティ保護）

詳細な設計思想やテーブル定義の説明については、[4_データベース設計書.md](4_データベース設計書.md)を参照してください。
