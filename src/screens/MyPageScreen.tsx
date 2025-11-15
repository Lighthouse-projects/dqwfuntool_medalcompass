import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { getUserCollections } from '../services/medalService';

export const MyPageScreen: React.FC = () => {
  const { user } = useAuth();
  const [collectionCount, setCollectionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  /**
   * 獲得メダル数を取得
   */
  useEffect(() => {
    const loadCollectionCount = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const collections = await getUserCollections(user.id);
        setCollectionCount(collections.length);
      } catch (error) {
        console.error('Load collection count error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCollectionCount();
  }, [user]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>マイページ</Text>

        {/* ユーザー情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ユーザー情報</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>メールアドレス:</Text>
            <Text style={styles.value}>{user?.email || '未設定'}</Text>
          </View>
        </View>

        {/* メダル獲得数 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メダル獲得状況</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {loading ? '...' : collectionCount}
              </Text>
              <Text style={styles.statLabel}>獲得メダル数</Text>
            </View>
          </View>
        </View>

        {/* アプリ情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリ情報</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>バージョン:</Text>
            <Text style={styles.value}>1.0.0</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 24,
    marginTop: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#757575',
    width: 140,
  },
  value: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
  },
});
