import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCollections } from '../../services/medalService';
import { MedalCollection } from '../../types/medal';
import { DateFilterModal } from './DateFilterModal';
import { COLORS, FONT_SIZES } from '../../constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// スナップポイント（画面の何%の高さにスナップするか）
const SNAP_POINTS = [0.2, 0.28, 0.36, 0.44, 0.52, 0.6];

interface HistoryPanelProps {
  visible: boolean;
  onClose: () => void;
  onMedalPress: (medalNo: number) => void;
  onMedalPressIn: (medalNo: number) => void;
  onMedalPressOut: () => void;
  onHeightChange?: (height: number) => void; // パネルの高さ変更を通知
  onDateFilter?: (date: string | null) => void; // 日付フィルター変更を通知
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  visible,
  onClose,
  onMedalPress,
  onMedalPressIn,
  onMedalPressOut,
  onHeightChange,
  onDateFilter,
}) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<MedalCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // パネルの高さをアニメーション管理
  const panelHeight = useRef(new Animated.Value(SCREEN_HEIGHT * 0.2)).current;
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0); // 初期は20%
  const dragStartHeight = useRef(SCREEN_HEIGHT * 0.2); // ドラッグ開始時の高さ

  // 日付フィルター関連
  const [dateFilterModalVisible, setDateFilterModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  /**
   * 最も近いスナップポイントにアニメーション
   */
  const snapToClosest = useCallback((gestureY: number) => {
    const currentHeight = SCREEN_HEIGHT - gestureY;
    const currentRatio = currentHeight / SCREEN_HEIGHT;

    // 最も近いスナップポイントを見つける
    let closestIndex = 0;
    let minDiff = Math.abs(SNAP_POINTS[0] - currentRatio);

    SNAP_POINTS.forEach((point, index) => {
      const diff = Math.abs(point - currentRatio);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    // 下にスワイプしすぎたら閉じる
    if (currentRatio < 0.15) {
      onClose();
      return;
    }

    const targetHeight = SCREEN_HEIGHT * SNAP_POINTS[closestIndex];
    setCurrentSnapIndex(closestIndex);
    dragStartHeight.current = targetHeight; // スナップ後の高さを記憶

    // アニメーション開始前に高さを通知（即座に反映）
    onHeightChange?.(targetHeight);

    Animated.spring(panelHeight, {
      toValue: targetHeight,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [panelHeight, onClose, onHeightChange]);

  /**
   * PanResponderの設定
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // タップでは反応しない
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 縦方向の移動が5px以上の場合のみドラッグ開始
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // ドラッグ開始時の実際の高さを記憶（アニメーション中の値も正確に取得）
        // @ts-ignore - Animated.Valueの内部プロパティにアクセス
        dragStartHeight.current = panelHeight._value || SCREEN_HEIGHT * SNAP_POINTS[currentSnapIndex];
      },
      onPanResponderMove: (_, gestureState) => {
        // ドラッグ開始時の高さを基準に、dyの変化分だけ調整
        // dyが負の値（上にドラッグ）なら高さを増やす、正の値（下にドラッグ）なら高さを減らす
        const newHeight = dragStartHeight.current - gestureState.dy;
        // 最小10%、最大90%に制限
        const clampedHeight = Math.max(
          SCREEN_HEIGHT * 0.1,
          Math.min(SCREEN_HEIGHT * 0.9, newHeight)
        );
        panelHeight.setValue(clampedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalHeight = dragStartHeight.current - gestureState.dy;
        const finalY = SCREEN_HEIGHT - finalHeight;
        snapToClosest(finalY);
      },
    })
  ).current;

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
   * パネル表示時に初期高さを通知
   */
  useEffect(() => {
    if (visible) {
      const initialHeight = SCREEN_HEIGHT * SNAP_POINTS[currentSnapIndex];
      onHeightChange?.(initialHeight);
    }
  }, [visible, currentSnapIndex, onHeightChange]);

  /**
   * 日付フィルター選択時の処理
   */
  const handleSelectDate = useCallback((date: string | null) => {
    setSelectedDate(date);
    onDateFilter?.(date);
  }, [onDateFilter]);

  /**
   * 日付フィルター適用済みのコレクション
   */
  const filteredCollections = useMemo(() => {
    if (!selectedDate) {
      return collections;
    }

    // 選択した日付と同じ日のメダルのみフィルタリング
    return collections.filter((collection) => {
      const collectionDate = new Date(collection.collected_at);
      const selectedDateObj = new Date(selectedDate);
      return (
        collectionDate.getFullYear() === selectedDateObj.getFullYear() &&
        collectionDate.getMonth() === selectedDateObj.getMonth() &&
        collectionDate.getDate() === selectedDateObj.getDate()
      );
    });
  }, [collections, selectedDate]);

  /**
   * メダルのある日付リストを生成
   */
  const markedDates = useMemo(() => {
    const dates = new Set<string>();
    collections.forEach((collection) => {
      const date = new Date(collection.collected_at);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dates.add(dateString);
    });
    return Array.from(dates);
  }, [collections]);

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
    <Animated.View style={[styles.panelContainer, { height: panelHeight }]} pointerEvents="box-none">
      <View style={styles.panel} pointerEvents="auto">
        {/* ドラッグハンドル */}
        <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>メダルの思い出</Text>
            <Text style={styles.subtitle}>
              {selectedDate ? `${filteredCollections.length} 個` : `合計 ${collections.length} 個`}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setDateFilterModalVisible(true)}
              style={styles.calendarButton}
            >
              <MaterialIcons
                name="calendar-today"
                size={24}
                color={selectedDate ? COLORS.PRIMARY : COLORS.TEXT_PRIMARY}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          </View>
        ) : collections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>まだメダルを獲得していません</Text>
            <Text style={styles.emptySubText}>探検モードでメダルを探してみましょう</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCollections}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.medal_no}-${item.collected_at}`}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* 日付フィルターモーダル */}
      <DateFilterModal
        visible={dateFilterModalVisible}
        onClose={() => setDateFilterModalVisible(false)}
        onSelectDate={handleSelectDate}
        selectedDate={selectedDate}
        markedDates={markedDates}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
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
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    cursor: 'grab',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#BDBDBD',
    borderRadius: 2,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarButton: {
    padding: 8,
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
    fontSize: FONT_SIZES.SMALL,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
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
