import AsyncStorage from '@react-native-async-storage/async-storage';

// ストレージキー
const STORAGE_KEYS = {
  APP_MODE: 'app_mode',
  MAP_STATE: 'map_state',
} as const;

// アプリモードの型定義
export type AppMode = 'registration' | 'exploration';

// マップ状態の型定義
export interface MapState {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

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

/**
 * マップ状態を保存
 * @param state 保存するマップ状態
 */
export async function saveMapState(state: MapState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MAP_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save map state:', error);
    // エラーは無視（UX影響を最小化）
  }
}

/**
 * 保存されているマップ状態を取得
 * @returns 保存されているマップ状態、または null
 */
export async function getMapState(): Promise<MapState | null> {
  try {
    const stateJson = await AsyncStorage.getItem(STORAGE_KEYS.MAP_STATE);

    if (!stateJson) {
      return null;
    }

    const state = JSON.parse(stateJson) as MapState;

    // バリデーション: 必須フィールドの存在チェック
    if (
      typeof state.latitude === 'number' &&
      typeof state.longitude === 'number' &&
      typeof state.latitudeDelta === 'number' &&
      typeof state.longitudeDelta === 'number'
    ) {
      return state;
    }

    // 不正な値の場合はnullを返す
    return null;
  } catch (error) {
    console.error('Failed to get map state:', error);
    return null;
  }
}

/**
 * 保存されているマップ状態をクリア（デバッグ用）
 */
export async function clearMapState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.MAP_STATE);
  } catch (error) {
    console.error('Failed to clear map state:', error);
  }
}
