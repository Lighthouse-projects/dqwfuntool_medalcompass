import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCollections } from '../../services/medalService';
import { MedalCollection } from '../../types/medal';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onMedalPress: (medalNo: number) => void;
  onMedalPressIn: (medalNo: number) => void;
  onMedalPressOut: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>獲得履歴</Text>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginRight: 8,
  },
  medalNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  itemDate: {
    fontSize: 12,
    color: '#757575',
  },
});
