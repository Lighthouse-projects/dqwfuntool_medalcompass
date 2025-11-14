import React from 'react';
import { View, StyleSheet } from 'react-native';
import CoinSvg from '../../../assets/coin.svg';
import Svg, { Circle, Path } from 'react-native-svg';

interface MedalMarkerProps {
  isOwnMedal: boolean; // 自分のメダルかどうか
}

/**
 * メダルマーカーのカスタムビューコンポーネント
 * coin.svgを使用
 * 自分のメダル・他人のメダル共に金色で表示
 */
export const MedalMarker: React.FC<MedalMarkerProps> = ({ isOwnMedal }) => {
  // 自分のメダルも他人のメダルも金色のSVG（デフォルト）
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
