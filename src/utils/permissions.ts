import * as Location from 'expo-location';

/**
 * 位置情報パーミッションを要求
 * @returns パーミッションが許可されたらtrue
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
}

/**
 * 現在のパーミッション状態を確認
 * @returns パーミッション状態
 */
export async function checkLocationPermission(): Promise<Location.PermissionStatus> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Permission check error:', error);
    return Location.PermissionStatus.UNDETERMINED;
  }
}
