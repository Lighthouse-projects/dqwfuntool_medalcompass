import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { getUserCollections } from '../services/medalService';
import { MedalCollection } from '../types/medal';
import { MainTabParamList } from '../navigation/MainNavigator';

type HistoryScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'History'>;

export const HistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [collections, setCollections] = useState<MedalCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 獲得履歴を読み込み
   */
  const loadCollections = async () => {
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
  };

  /**
   * 初回読み込み
   */
  useEffect(() => {
    loadCollections();
  }, [user]);

  /**
   * 引っ張って更新
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  };

  /**
   * 日時をフォーマット
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  /**
   * メダルをタップして地図に移動
   */
  const handleMedalPress = (medalNo: number) => {
    navigation.navigate('Map', { medalNo });
  };

  /**
   * リストアイテムのレンダリング
   */
  const renderItem = ({ item, index }: { item: MedalCollection; index: number }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleMedalPress(item.medal_no)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemNumber}>#{index + 1}</Text>
        <Text style={styles.medalNumber}>メダルNo. {item.medal_no}</Text>
      </View>
      <Text style={styles.itemDate}>{formatDate(item.collected_at)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>獲得履歴</Text>
        <Text style={styles.subtitle}>合計 {collections.length} 個</Text>
      </View>

      {collections.length === 0 ? (
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#1E88E5"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginRight: 12,
  },
  medalNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  itemDate: {
    fontSize: 14,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
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
});
