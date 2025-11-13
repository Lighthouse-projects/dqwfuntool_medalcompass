// メダルの型定義
export interface Medal {
  medal_no: number;                // メダル番号（連番、主キー）
  user_id: string;                 // 登録ユーザーID
  latitude: number;                // 緯度
  longitude: number;               // 経度
  is_deleted: boolean;             // 削除フラグ
  deleted_at: string | null;       // 削除日時
  created_at: string;              // 登録日時
  updated_at: string;              // 更新日時
}

// メダル登録用の型
export interface MedalInsertInput {
  user_id: string;
  latitude: number;
  longitude: number;
}

// GPS座標の型
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;         // 測位精度（メートル）
}

// 位置情報の状態
export interface LocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

// メダル通報の型定義
export interface MedalReport {
  id: number;                          // 通報ID（連番、主キー）
  medal_no: number;                    // メダル番号
  reporter_user_id: string;            // 通報者のユーザーID
  created_at: string;                  // 通報日時
}

// メダル通報登録用の型
export interface MedalReportInsertInput {
  medal_no: number;
  reporter_user_id: string;
}
