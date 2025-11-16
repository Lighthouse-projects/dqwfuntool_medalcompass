/**
 * アプリ全体で使用するテーマ定数
 * UI設計書（documents/7_UI設計書.md）に基づく
 */

// ==================== カラーパレット ====================

/**
 * プライマリカラー
 */
export const COLORS = {
  // プライマリ
  PRIMARY: '#50C878',        // メインカラー（エメラルドグリーン）- ボタン、アクティブ要素
  ACCENT: '#FFC107',         // アクセントカラー（黄色）- 他人のメダル
  SILVER: '#9E9E9E',         // シルバーカラー（銀色）- 自分のメダル

  // セマンティック
  SUCCESS: '#4CAF50',        // 成功（緑）
  ERROR: '#F44336',          // エラー（赤）- 削除ボタン
  WARNING: '#FF9800',        // 警告（オレンジ）
  INFO: '#2196F3',           // 情報（青）

  // 背景・テキスト
  BACKGROUND: '#FFFFFF',     // 背景（白）
  BACKGROUND_SECONDARY: '#F5F5F5',  // セカンダリ背景（ライトグレー）
  TEXT_PRIMARY: '#212121',   // テキストプライマリ（ダークグレー）
  TEXT_SECONDARY: '#757575', // テキストセカンダリ（グレー）
  BORDER: '#E0E0E0',         // ボーダー（ライトグレー）
  PLACEHOLDER: '#BDBDBD',    // プレースホルダー（グレー）

  // 透明
  TRANSPARENT: 'transparent',
  OVERLAY: 'rgba(0, 0, 0, 0.5)',  // モーダル背景オーバーレイ
} as const;

// ==================== フォントサイズ ====================

export const FONT_SIZES = {
  XLARGE: 24,   // 特大 - 画面タイトル
  LARGE: 18,    // 大 - セクションタイトル
  MEDIUM: 16,   // 中 - ボタンテキスト、本文
  SMALL: 14,    // 小 - サブテキスト、キャプション
  XSMALL: 12,   // 極小 - 注釈、補足情報
} as const;

// ==================== フォントウェイト ====================

export const FONT_WEIGHTS = {
  BOLD: '700' as const,      // 見出し、ボタン
  MEDIUM: '500' as const,    // 強調テキスト
  REGULAR: '400' as const,   // 本文、通常テキスト
} as const;

// ==================== スペーシング ====================

export const SPACING = {
  XSMALL: 4,
  SMALL: 8,
  MEDIUM: 16,
  LARGE: 24,
  XLARGE: 32,
} as const;

// ==================== ボーダー半径 ====================

export const BORDER_RADIUS = {
  SMALL: 6,
  MEDIUM: 8,
  LARGE: 12,
  XLARGE: 16,
  ROUND: 24,   // 完全な円形
} as const;

// ==================== サイズ ====================

export const SIZES = {
  // ボタン
  BUTTON_HEIGHT: 50,
  BUTTON_HEIGHT_SMALL: 40,

  // アイコン
  ICON_SMALL: 24,
  ICON_MEDIUM: 28,
  ICON_LARGE: 32,
  ICON_XLARGE: 40,

  // ヘッダー
  HEADER_HEIGHT: 56,

  // タップ領域（アクセシビリティ対応）
  MIN_TAP_SIZE: 44,

  // 入力フィールド
  INPUT_HEIGHT: 50,
} as const;

// ==================== 影（Shadow） ====================

export const SHADOWS = {
  LIGHT: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  MEDIUM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  HEAVY: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
} as const;

// ==================== アニメーション ====================

export const ANIMATION = {
  DURATION_SHORT: 200,   // ms
  DURATION_MEDIUM: 300,  // ms
  DURATION_LONG: 400,    // ms
} as const;

// ==================== 地図関連 ====================

export const MAP = {
  DEFAULT_LATITUDE: 35.681236,   // デフォルト位置（東京駅）
  DEFAULT_LONGITUDE: 139.767125,
  DEFAULT_LATITUDE_DELTA: 0.01,  // ズームレベル（約1km）
  DEFAULT_LONGITUDE_DELTA: 0.01,
  FETCH_RADIUS_KM: 5,            // メダル取得範囲（5km）
  HIGHLIGHT_CIRCLE_RADIUS: 50,   // ハイライト円の半径（メートル）
} as const;
