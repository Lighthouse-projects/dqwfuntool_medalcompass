import * as Location from 'expo-location';
import { Coordinates } from '../types/medal';

/**
 * 角度をラジアンに変換
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Haversine公式を使用して2点間の距離を計算（メートル単位）
 * @param lat1 地点1の緯度
 * @param lon1 地点1の経度
 * @param lat2 地点2の緯度
 * @param lon2 地点2の経度
 * @returns 距離（メートル）
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // 地球の半径（メートル）
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 距離（メートル）
}

/**
 * 現在位置を取得
 * @returns GPS座標
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // 5秒タイムアウト（GPS取得の待ち時間を短縮）
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    throw new Error('現在地を取得できませんでした。再度お試しください。');
  }
}

/**
 * 測位精度が十分かチェック
 * @param accuracy 測位精度（メートル）
 * @returns 精度が十分ならtrue
 */
export function isAccuracyGoodEnough(accuracy: number | null): boolean {
  if (accuracy === null) return false;
  return accuracy <= 20; // 20メートル以下なら良好
}

/**
 * 緯度経度の範囲を計算（5メートル範囲の矩形）
 * @param latitude 中心の緯度
 * @param longitude 中心の経度
 * @param radiusMeters 半径（メートル）
 * @returns 範囲の緯度経度
 */
export function calculateBoundingBox(
  latitude: number,
  longitude: number,
  radiusMeters: number = 5
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  // 1度あたりの距離（緯度方向は約111km）
  const latDelta = radiusMeters / 111000;

  // 経度方向は緯度によって変わる
  const lonDelta = radiusMeters / (111000 * Math.cos(toRadians(latitude)));

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLon: longitude - lonDelta,
    maxLon: longitude + lonDelta,
  };
}
