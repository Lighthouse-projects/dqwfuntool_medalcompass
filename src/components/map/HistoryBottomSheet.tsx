import React, { useState, useEffect, useMemo, forwardRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCollections } from '../../services/medalService';
import { MedalCollection } from '../../types/medal';

interface HistoryBottomSheetProps {
  onMedalPress: (medalNo: number) => void;
  onMedalPressIn: (medalNo: number) => void;
  onMedalPressOut: () => void;
}

export const HistoryBottomSheet = forwardRef<BottomSheet, HistoryBottomSheetProps>(
  ({ onMedalPress, onMedalPressIn, onMedalPressOut }, ref) => {
    const { user } = useAuth();
    const [collections, setCollections] = useState<MedalCollection[]>([]);
    const [loading, setLoading] = useState(true);

    // ボトムシートのスナップポイント
    const snapPoints = useMemo(() => ['12%', '33%', '90%'], []);

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
      loadCollections();
    }, [loadCollections]);

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
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.header}>
          <Text style={styles.title}>獲得履歴</Text>
          <Text style={styles.subtitle}>合計 {collections.length} 個</Text>
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
          <BottomSheetFlatList
            data={collections}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.medal_no}-${item.collected_at}`}
            contentContainerStyle={styles.listContent}
          />
        )}
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
  },
  handleIndicator: {
    backgroundColor: '#BDBDBD',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
