import { useState, useEffect } from 'react';
import { LocationState } from '../types/medal';
import { getCurrentLocation } from '../utils/location';
import { requestLocationPermission, checkLocationPermission } from '../utils/permissions';
import * as Location from 'expo-location';

/**
 * 位置情報取得のカスタムフック
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coordinates: null,
    loading: false,
    error: null,
    hasPermission: false,
  });

  // 初期化時にパーミッション状態を確認
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  /**
   * パーミッション状態を確認
   */
  const checkPermissionStatus = async () => {
    try {
      const status = await checkLocationPermission();
      setState((prev) => ({
        ...prev,
        hasPermission: status === Location.PermissionStatus.GRANTED,
      }));
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  /**
   * パーミッションを要求
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await requestLocationPermission();
      setState((prev) => ({
        ...prev,
        hasPermission: granted,
        error: granted ? null : '位置情報の利用を許可してください',
      }));
      return granted;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: '位置情報パーミッションの取得に失敗しました',
      }));
      return false;
    }
  };

  /**
   * 現在位置を取得
   */
  const fetchCurrentLocation = async (): Promise<{ success: boolean; coordinates: typeof state.coordinates }> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // パーミッションチェック
      if (!state.hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: '位置情報の利用を許可してください',
          }));
          return { success: false, coordinates: null };
        }
      }

      // GPS座標取得
      const coordinates = await getCurrentLocation();
      setState((prev) => ({
        ...prev,
        coordinates,
        loading: false,
        error: null,
      }));
      return { success: true, coordinates };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
      return { success: false, coordinates: null };
    }
  };

  return {
    ...state,
    requestPermission,
    getCurrentLocation: fetchCurrentLocation,
  };
}
