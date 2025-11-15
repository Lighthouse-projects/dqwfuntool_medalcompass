import AsyncStorage from '@react-native-async-storage/async-storage';

// ストレージキー
const STORAGE_KEYS = {
  APP_MODE: 'app_mode',
} as const;

// アプリモードの型定義
export type AppMode = 'registration' | 'exploration';

// デフォルト値
const DEFAULT_MODE: AppMode = 'exploration';

/**
 * 現在のモードを保存
 * @param mode 保存するモード
 */
export async function saveAppMode(mode: AppMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_MODE, mode);
  } catch (error) {
    console.error('Failed to save app mode:', error);
    // エラーは無視（UX影響を最小化）
  }
}

/**
 * 保存されているモードを取得
 * @returns 保存されているモード、または デフォルト値（exploration）
 */
export async function getAppMode(): Promise<AppMode> {
  try {
    const mode = await AsyncStorage.getItem(STORAGE_KEYS.APP_MODE);

    // バリデーション: 正しいモード値かチェック
    if (mode === 'registration' || mode === 'exploration') {
      return mode;
    }

    // 保存値がない、または不正な値の場合はデフォルト
    return DEFAULT_MODE;
  } catch (error) {
    console.error('Failed to get app mode:', error);
    // エラー時もデフォルト値を返す
    return DEFAULT_MODE;
  }
}

/**
 * 保存されているモードをクリア（デバッグ用）
 */
export async function clearAppMode(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.APP_MODE);
  } catch (error) {
    console.error('Failed to clear app mode:', error);
  }
}
