import React from 'react';
import { View, StyleSheet } from 'react-native';
import CoinSvg from '../../../assets/coin.svg';
import Svg, { Circle } from 'react-native-svg';

interface MedalMarkerProps {
  isOwnMedal: boolean; // 自分のメダルかどうか
  mode: 'registration' | 'exploration'; // 現在のモード
  isCollected?: boolean; // 獲得済みかどうか（冒険モード用）
}

/**
 * メダルマーカーのカスタムビューコンポーネント
 *
 * 色分けルール:
 * - 登録モード: 自分のメダル=金色、他人のメダル=グレー
 * - 冒険モード: 未獲得メダル=金色、獲得済みメダル=グレー
 */
export const MedalMarker: React.FC<MedalMarkerProps> = ({
  isOwnMedal,
  mode,
  isCollected = false
}) => {
  // 色を決定
  const shouldBeGold = mode === 'registration'
    ? isOwnMedal  // 登録モード: 自分のメダルが金色
    : !isCollected; // 冒険モード: 未獲得が金色

  // グレー表示の場合はSVGサークルで描画
  if (!shouldBeGold) {
    return (
      <View style={styles.container}>
        <Svg width="20" height="20" viewBox="0 0 100 100">
          <Circle
            cx="50"
            cy="50"
            r="45"
            fill="#9E9E9E"
            stroke="#616161"
            strokeWidth="4"
          />
        </Svg>
      </View>
    );
  }

  // 金色表示の場合はcoin.svgを使用
  return (
    <View style={styles.container}>
      <CoinSvg width="20" height="20" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3, // Android用の影
  },
});
