import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Medal } from '../../types/medal';

interface MedalCalloutProps {
  medal: Medal;
  isOwnMedal: boolean;
  onDelete: () => void;
  onReport?: () => void; // F006用（誤メダル通報）
}

/**
 * メダルマーカーをタップした時の吹き出し（Callout）コンポーネント
 */
export const MedalCallout: React.FC<MedalCalloutProps> = ({
  medal,
  isOwnMedal,
  onDelete,
  onReport,
}) => {
  // 登録日時をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isOwnMedal ? '自分のメダル' : 'メダル'}
      </Text>

      <Text style={styles.date}>
        登録日: {formatDate(medal.created_at)}
      </Text>

      {isOwnMedal ? (
        // 自分のメダル: 削除ボタン
        <Pressable
          style={[styles.button, styles.deleteButton]}
          onPress={onDelete}
        >
          <Text style={styles.deleteButtonText}>削除</Text>
        </Pressable>
      ) : (
        // 他人のメダル: 通報ボタン（F006で実装予定）
        onReport && (
          <Pressable
            style={[styles.button, styles.reportButton]}
            onPress={onReport}
          >
            <Text style={styles.reportButtonText}>誤メダルとして通報</Text>
          </Pressable>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 200,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reportButton: {
    backgroundColor: '#FF9800',
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
