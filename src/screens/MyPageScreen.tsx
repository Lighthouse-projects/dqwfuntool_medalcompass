import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { getUserCollections, getUserMedals } from '../services/medalService';

export const MyPageScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [collectionCount, setCollectionCount] = useState<number>(0);
  const [registeredCount, setRegisteredCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  /**
   * 獲得メダル数と登録メダル数を取得
   */
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [collections, registeredMedals] = await Promise.all([
          getUserCollections(user.id),
          getUserMedals(user.id),
        ]);
        setCollectionCount(collections.length);
        setRegisteredCount(registeredMedals.length);
      } catch (error) {
        console.error('Load stats error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
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

        {/* メダル統計 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メダル統計</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {loading ? '...' : collectionCount}
              </Text>
              <Text style={styles.statLabel}>獲得メダル数</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {loading ? '...' : registeredCount}
              </Text>
              <Text style={styles.statLabel}>登録メダル数</Text>
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

        {/* ログアウトボタン */}
        <View style={styles.logoutButtonContainer}>
          <Button
            title="ログアウト"
            onPress={handleLogout}
            variant="secondary"
          />
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
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
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
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
  logoutButtonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
});
