import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Linking, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../components/common/Button';
import { MedalMarker } from '../components/map/MedalMarker';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { registerMedal, getMedalsWithinRadius, deleteMedal, reportMedal, getMedalReportCount, hasUserReportedMedal, checkAndInvalidateMedal, checkAndBanUser } from '../services/medalService';
import { isAccuracyGoodEnough } from '../utils/location';
import { Medal } from '../types/medal';

export const MapScreen: React.FC = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [registering, setRegistering] = useState(false);
  const [medals, setMedals] = useState<Medal[]>([]);
  const [loadingMedals, setLoadingMedals] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<MapView>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初期表示位置: 現在地を中心に半径1km
  const [region, setRegion] = useState<Region | null>(null);

  /**
   * 初期表示: 現在地を取得してマップ中心に設定
   */
  useEffect(() => {
    const initializeMap = async () => {
      const result = await location.getCurrentLocation();

      if (result.success && result.coordinates) {
        const newRegion: Region = {
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude,
          latitudeDelta: 0.01, // 約1km
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setMapInitialized(true);

        // 初期メダル取得
        fetchMedalsInRegion(
          result.coordinates.latitude,
          result.coordinates.longitude
        );
      } else {
        // 現在地取得失敗時はデフォルト（東京）を使用
        const fallbackRegion: Region = {
          latitude: 35.681236,
          longitude: 139.767125,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(fallbackRegion);
        setMapInitialized(true);
      }
    };

    initializeMap();
  }, []);

  /**
   * 指定座標周辺のメダルを取得（半径5km）
   */
  const fetchMedalsInRegion = async (lat: number, lon: number) => {
    setLoadingMedals(true);
    try {
      const fetchedMedals = await getMedalsWithinRadius(lat, lon, 5);
      setMedals(fetchedMedals);
    } catch (error) {
      console.error('Fetch medals error:', error);
    } finally {
      setLoadingMedals(false);
    }
  };

  /**
   * マップ範囲変更時の処理
   */
  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
    // 自動再読み込みは無効化（手動の「メダル再読み込み」ボタンで取得）
  }, []);

  /**
   * 現在地ボタン: 現在地へ移動
   */
  const handleGoToCurrentLocation = async () => {
    const result = await location.getCurrentLocation();
    if (result.success && result.coordinates) {
      const newRegion: Region = {
        latitude: result.coordinates.latitude,
        longitude: result.coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(newRegion, 1000);
    } else {
      Alert.alert('エラー', '現在地を取得できませんでした');
    }
  };

  /**
   * メダル再読み込み
   */
  const handleRefreshMedals = async () => {
    const result = await location.getCurrentLocation();
    if (result.success && result.coordinates) {
      await fetchMedalsInRegion(result.coordinates.latitude, result.coordinates.longitude);
      Alert.alert('完了', 'メダルを再読み込みしました');
    } else {
      Alert.alert('エラー', '現在地を取得できませんでした');
    }
  };

  /**
   * メダル登録処理
   */
  const handleRegisterMedal = async () => {
    if (!user) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }

    setRegistering(true);

    try {
      // 1. 位置情報パーミッションチェック
      if (!location.hasPermission) {
        const granted = await location.requestPermission();
        if (!granted) {
          Alert.alert(
            '位置情報が必要です',
            'メダルを登録するには位置情報の利用を許可してください。',
            [
              { text: 'キャンセル', style: 'cancel' },
              {
                text: '設定を開く',
                onPress: () => Linking.openSettings()
              },
            ]
          );
          setRegistering(false);
          return;
        }
      }

      // 2. GPS座標取得
      const result = await location.getCurrentLocation();
      if (!result.success || !result.coordinates) {
        Alert.alert('エラー', '現在地を取得できませんでした。再度お試しください。');
        setRegistering(false);
        return;
      }

      const { latitude, longitude, accuracy } = result.coordinates;

      // 3. 測位精度チェック
      if (!isAccuracyGoodEnough(accuracy)) {
        const proceed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            '測位精度が低いです',
            `現在の測位精度: ${accuracy?.toFixed(0) || '不明'}m\n登録を続けますか？`,
            [
              {
                text: 'キャンセル',
                style: 'cancel',
                onPress: () => resolve(false),
              },
              {
                text: '登録する',
                onPress: () => resolve(true),
              },
            ]
          );
        });

        if (!proceed) {
          setRegistering(false);
          return;
        }
      }

      // 4. メダル登録
      const newMedal = await registerMedal(user.id, latitude, longitude);

      // 5. メダルリストに追加（即座に反映）
      setMedals((prev) => [...prev, newMedal]);

      // 6. 成功通知
      Alert.alert('成功', '✅ メダルを登録しました', [{ text: 'OK' }]);

    } catch (error) {
      console.error('Register medal error:', error);
      Alert.alert('エラー', (error as Error).message);
    } finally {
      setRegistering(false);
    }
  };

  /**
   * マーカータップ時の処理
   */
  const handleMarkerPress = async (medal: Medal) => {
    const isOwn = medal.user_id === user?.id;

    // 登録日時をフォーマット
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (isOwn) {
      // 自分のメダル: 削除オプションを表示
      Alert.alert(
        '自分のメダル',
        `登録日: ${formatDate(medal.created_at)}`,
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
          {
            text: '削除',
            style: 'destructive',
            onPress: () => handleDeleteMedal(medal),
          },
        ]
      );
    } else {
      // 他人のメダル: 通報オプションを表示
      try {
        // 通報数を取得
        const reportCount = await getMedalReportCount(medal.medal_no);

        // 自分が通報済みかチェック
        const hasReported = user ? await hasUserReportedMedal(medal.medal_no, user.id) : false;

        const message = `登録日: ${formatDate(medal.created_at)}\n${reportCount >= 3 ? `通報数: ${reportCount}件\n` : ''}${hasReported ? '（通報済み）' : ''}`;

        Alert.alert(
          'メダル',
          message,
          [
            {
              text: 'キャンセル',
              style: 'cancel',
            },
            ...(!hasReported ? [{
              text: '誤メダルとして通報',
              style: 'destructive' as const,
              onPress: () => handleReportMedal(medal),
            }] : []),
          ]
        );
      } catch (error) {
        console.error('Get medal info error:', error);
        Alert.alert('エラー', 'メダル情報の取得に失敗しました');
      }
    }
  };

  /**
   * メダル通報処理
   */
  const handleReportMedal = async (medal: Medal) => {
    if (!user) {
      Alert.alert('エラー', 'ログインしてください');
      return;
    }

    // 確認ダイアログ表示
    Alert.alert(
      '誤メダルとして通報',
      'このメダルを誤メダルとして通報しますか？\n通報は取り消せません。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '通報する',
          style: 'destructive',
          onPress: async () => {
            try {
              // メダル通報
              await reportMedal(medal.medal_no, user.id);

              // 5通報以上の場合、メダルを無効化
              await checkAndInvalidateMedal(medal.medal_no);

              // メダルの登録者の通報受信数をチェック、10通報以上ならBAN
              await checkAndBanUser(medal.user_id);

              // ステートからメダル削除（無効化されている可能性があるため）
              const reportCount = await getMedalReportCount(medal.medal_no);
              if (reportCount >= 5) {
                setMedals((prev) =>
                  prev.filter((m) => m.medal_no !== medal.medal_no)
                );
              }

              // 成功通知
              Alert.alert('完了', '通報しました');
            } catch (error) {
              console.error('Report medal error:', error);
              Alert.alert('エラー', (error as Error).message);
            }
          },
        },
      ]
    );
  };

  /**
   * メダル削除処理
   */
  const handleDeleteMedal = async (medal: Medal) => {
    // 確認ダイアログ表示
    Alert.alert(
      'メダルを削除',
      'このメダルを削除しますか？\n削除後は復元できません。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              // メダル削除API呼び出し
              await deleteMedal(medal.medal_no);

              // ステートからメダル削除（即座に画面から消える）
              setMedals((prev) =>
                prev.filter((m) => m.medal_no !== medal.medal_no)
              );

              // 成功通知
              Alert.alert('成功', 'メダルを削除しました');
            } catch (error) {
              console.error('Delete medal error:', error);
              Alert.alert('エラー', (error as Error).message);
            }
          },
        },
      ]
    );
  };

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 現在地取得中はローディング表示
  if (!mapInitialized || !region) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>現在地を取得中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* マップビュー */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false} // カスタムボタンを使用
        loadingEnabled={true}
      >
        {/* メダルマーカー表示 */}
        {medals.map((medal) => (
          <Marker
            key={medal.medal_no}
            coordinate={{
              latitude: medal.latitude,
              longitude: medal.longitude,
            }}
            onPress={() => handleMarkerPress(medal)}
          >
            <MedalMarker isOwnMedal={medal.user_id === user?.id} />
          </Marker>
        ))}
      </MapView>

      {/* 現在地ボタン（右下） */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={handleGoToCurrentLocation}
        disabled={location.loading}
      >
        <MaterialIcons name="my-location" size={28} color="#1E88E5" />
      </TouchableOpacity>

      {/* 下部コントロールエリア */}
      <View style={styles.bottomControls}>
        <View style={styles.buttonContainer}>
          <Button
            title="📍 メダルを登録"
            onPress={handleRegisterMedal}
            loading={registering || location.loading}
            style={styles.registerButton}
          />

          <View style={styles.horizontalButtons}>
            <Button
              title="🔄 再読込"
              onPress={handleRefreshMedals}
              loading={loadingMedals}
              variant="secondary"
              style={styles.refreshButton}
            />

            <Button
              title="ログアウト"
              onPress={handleLogout}
              variant="secondary"
              style={styles.logoutButton}
            />
          </View>
        </View>

        {location.error && (
          <Text style={styles.errorText}>{location.error}</Text>
        )}

        {loadingMedals && (
          <Text style={styles.loadingText}>メダルを読み込み中...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonContainer: {
    gap: 8,
  },
  registerButton: {
    marginBottom: 8,
  },
  horizontalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    flex: 1,
  },
  logoutButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 8,
    textAlign: 'center',
  },
});
