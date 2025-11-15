import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCollections } from '../../services/medalService';
import { MedalCollection } from '../../types/medal';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface HistoryPanelProps {
  visible: boolean;
  onClose: () => void;
  onMedalPress: (medalNo: number) => void;
  onMedalPressIn: (medalNo: number) => void;
  onMedalPressOut: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  visible,
  onClose,
  onMedalPress,
  onMedalPressIn,
  onMedalPressOut,
}) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<MedalCollection[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 獲得履歴を読み込み
   */
  const loadCollections = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserCollections(user.id);
      // 獲得日時の降順（新しい順）でソート
      const sortedData = data.sort((a, b) =>
        new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime()
      );
      setCollections(sortedData);
    } catch (error) {
      console.error('Load collections error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * 初回読み込み
   */
  useEffect(() => {
    if (visible) {
      loadCollections();
    }
  }, [visible, loadCollections]);

  /**
   * 日時をフォーマット
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  /**
   * リストアイテムのレンダリング
   */
  const renderItem = useCallback(({ item, index }: { item: MedalCollection; index: number }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onMedalPress(item.medal_no)}
      onPressIn={() => onMedalPressIn(item.medal_no)}
      onPressOut={onMedalPressOut}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemNumber}>#{index + 1}</Text>
        <Text style={styles.medalNumber}>メダルNo. {item.medal_no}</Text>
      </View>
      <Text style={styles.itemDate}>{formatDate(item.collected_at)}</Text>
    </TouchableOpacity>
  ), [onMedalPress, onMedalPressIn, onMedalPressOut]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.panelContainer} pointerEvents="box-none">
      <View style={styles.panel} pointerEvents="auto">
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>メダルの思い出</Text>
            <Text style={styles.subtitle}>合計 {collections.length} 個</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#424242" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E88E5" />
          </View>
        ) : collections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>まだメダルを獲得していません</Text>
            <Text style={styles.emptySubText}>探検モードでメダルを探してみましょう</Text>
          </View>
        ) : (
          <FlatList
            data={collections}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.medal_no}-${item.collected_at}`}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.25,
  },
  panel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  listContent: {
    padding: 12,
  },
  itemContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginRight: 6,
  },
  medalNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  itemDate: {
    fontSize: 11,
    color: '#757575',
  },
});
