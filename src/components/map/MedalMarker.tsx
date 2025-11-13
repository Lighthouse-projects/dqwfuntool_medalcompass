import React from 'react';
import { View, StyleSheet } from 'react-native';

interface MedalMarkerProps {
  isOwnMedal: boolean; // 自分のメダルかどうか
}

/**
 * メダルマーカーのカスタムビューコンポーネント
 * 自分のメダル: 銀色 (#9E9E9E)
 * 他人のメダル: 黄色 (#FFC107)
 */
export const MedalMarker: React.FC<MedalMarkerProps> = ({ isOwnMedal }) => {
  return (
    <View
      style={[
        styles.marker,
        { backgroundColor: isOwnMedal ? '#9E9E9E' : '#FFC107' },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20, // 円形
    borderWidth: 3,
    borderColor: '#FFFFFF', // 白い縁取り
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Android用の影
  },
});
