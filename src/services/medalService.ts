import { supabase } from '../lib/supabase';
import { Medal, MedalInsertInput, MedalReport, MedalReportInsertInput, MedalCollection, MedalCollectionInsertInput } from '../types/medal';
import { calculateDistance, calculateBoundingBox } from '../utils/location';

/**
 * メダルを登録
 * @param userId ユーザーID
 * @param latitude 緯度
 * @param longitude 経度
 * @returns 登録されたメダル
 */
export async function registerMedal(
  userId: string,
  latitude: number,
  longitude: number
): Promise<Medal> {
  try {
    // メダルを登録
    const medalData: MedalInsertInput = {
      user_id: userId,
      latitude,
      longitude,
    };

    const { data, error } = await supabase
      .from('medals')
      .insert(medalData)
      .select()
      .single();

    if (error) {
      console.error('Register medal error:', error);
      throw new Error('登録に失敗しました。再度お試しください。');
    }

    if (!data) {
      throw new Error('登録に失敗しました。');
    }

    return data;
  } catch (error) {
    console.error('Register medal error:', error);
    throw error;
  }
}

/**
 * ユーザーのメダル一覧を取得
 * @param userId ユーザーID
 * @returns ユーザーのメダル配列
 */
export async function getUserMedals(userId: string): Promise<Medal[]> {
  try {
    const { data, error } = await supabase
      .from('medals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user medals error:', error);
      throw new Error('メダル一覧の取得に失敗しました');
    }

    return data || [];
  } catch (error) {
    console.error('Get user medals error:', error);
    throw error;
  }
}

/**
 * 指定座標から半径内のメダルを取得（マップ表示用）
 * @param centerLat 中心の緯度
 * @param centerLon 中心の経度
 * @param radiusKm 半径（キロメートル）デフォルト5km
 * @returns 範囲内のメダル配列
 */
export async function getMedalsWithinRadius(
  centerLat: number,
  centerLon: number,
  radiusKm: number = 5
): Promise<Medal[]> {
  try {
    // 半径5kmの矩形範囲を計算
    const bounds = calculateBoundingBox(centerLat, centerLon, radiusKm * 1000);

    // Supabaseから範囲内のメダルを取得
    const { data, error } = await supabase
      .from('medals')
      .select('*')
      .eq('is_deleted', false) // 削除済みメダルは除外
      .gte('latitude', bounds.minLat)
      .lte('latitude', bounds.maxLat)
      .gte('longitude', bounds.minLon)
      .lte('longitude', bounds.maxLon)
      .limit(1000); // 最大1000件

    if (error) {
      console.error('Get medals within radius error:', error);
      throw new Error('メダルの取得に失敗しました');
    }

    return data || [];
  } catch (error) {
    console.error('Get medals within radius error:', error);
    throw error;
  }
}

/**
 * メダルを削除
 * @param medalNo メダル番号
 * @returns void
 */
export async function deleteMedal(medalNo: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('medals')
      .delete()
      .eq('medal_no', medalNo);

    if (error) {
      console.error('Delete medal error:', error);
      throw new Error('削除に失敗しました。再度お試しください。');
    }
  } catch (error) {
    console.error('Delete medal error:', error);
    throw error;
  }
}

/**
 * メダルを通報
 * @param medalNo メダル番号
 * @param reporterUserId 通報者のユーザーID
 * @returns void
 */
export async function reportMedal(
  medalNo: number,
  reporterUserId: string
): Promise<void> {
  try {
    const reportData: MedalReportInsertInput = {
      medal_no: medalNo,
      reporter_user_id: reporterUserId,
    };

    const { error } = await supabase
      .from('medal_reports')
      .insert(reportData);

    if (error) {
      // UNIQUE制約エラー（重複通報）の場合
      if (error.code === '23505') {
        throw new Error('既に通報済みです');
      }
      console.error('Report medal error:', error);
      throw new Error('通報に失敗しました。再度お試しください。');
    }
  } catch (error) {
    console.error('Report medal error:', error);
    throw error;
  }
}

/**
 * メダルの通報数を取得
 * @param medalNo メダル番号
 * @returns 通報数
 */
export async function getMedalReportCount(medalNo: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('medal_reports')
      .select('*', { count: 'exact', head: true })
      .eq('medal_no', medalNo);

    if (error) {
      console.error('Get medal report count error:', error);
      throw new Error('通報数の取得に失敗しました');
    }

    return count || 0;
  } catch (error) {
    console.error('Get medal report count error:', error);
    throw error;
  }
}

/**
 * ユーザーが特定のメダルを通報済みかチェック
 * @param medalNo メダル番号
 * @param userId ユーザーID
 * @returns 通報済みならtrue
 */
export async function hasUserReportedMedal(
  medalNo: number,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('medal_reports')
      .select('report_id')
      .eq('medal_no', medalNo)
      .eq('reporter_user_id', userId)
      .limit(1);

    if (error) {
      console.error('Check user reported medal error:', error);
      throw new Error('通報状態の確認に失敗しました');
    }

    return (data && data.length > 0) || false;
  } catch (error) {
    console.error('Check user reported medal error:', error);
    throw error;
  }
}

/**
 * メダルが5通報以上の場合、is_deletedをtrueに更新
 * @param medalNo メダル番号
 * @returns void
 */
export async function checkAndInvalidateMedal(medalNo: number): Promise<void> {
  try {
    // 通報数を取得
    const reportCount = await getMedalReportCount(medalNo);

    // 5通報以上の場合、メダルを無効化
    if (reportCount >= 5) {
      const { error } = await supabase
        .from('medals')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('medal_no', medalNo);

      if (error) {
        console.error('Invalidate medal error:', error);
        throw new Error('メダル無効化に失敗しました');
      }
    }
  } catch (error) {
    console.error('Check and invalidate medal error:', error);
    throw error;
  }
}

/**
 * ユーザーの通報受信数を取得
 * @param userId ユーザーID
 * @returns 通報受信数
 */
export async function getUserReportReceivedCount(userId: string): Promise<number> {
  try {
    // ユーザーのメダルを取得
    const { data: userMedals, error: medalsError } = await supabase
      .from('medals')
      .select('medal_no')
      .eq('user_id', userId);

    if (medalsError) {
      console.error('Get user medals error:', medalsError);
      throw new Error('ユーザーメダルの取得に失敗しました');
    }

    if (!userMedals || userMedals.length === 0) {
      return 0;
    }

    // ユーザーのメダルに対する通報数を集計
    const medalNos = userMedals.map((m) => m.medal_no);
    const { count, error: reportsError } = await supabase
      .from('medal_reports')
      .select('*', { count: 'exact', head: true })
      .in('medal_no', medalNos);

    if (reportsError) {
      console.error('Get user report received count error:', reportsError);
      throw new Error('通報受信数の取得に失敗しました');
    }

    return count || 0;
  } catch (error) {
    console.error('Get user report received count error:', error);
    throw error;
  }
}

/**
 * ユーザーが10通報以上受けている場合、全メダルを無効化（BAN）
 * @param userId ユーザーID
 * @returns void
 */
export async function checkAndBanUser(userId: string): Promise<void> {
  try {
    // ユーザーの通報受信数を取得
    const reportReceivedCount = await getUserReportReceivedCount(userId);

    // 10通報以上の場合、ユーザーの全メダルを無効化
    if (reportReceivedCount >= 10) {
      const { error } = await supabase
        .from('medals')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Ban user error:', error);
        throw new Error('ユーザーBAN処理に失敗しました');
      }
    }
  } catch (error) {
    console.error('Check and ban user error:', error);
    throw error;
  }
}

// ========================================
// メダル獲得関連の機能
// ========================================

/**
 * メダルを獲得（冒険モード）
 * @param userId ユーザーID
 * @param medalNo メダル番号
 * @returns 獲得レコード
 */
export async function collectMedal(
  userId: string,
  medalNo: number
): Promise<MedalCollection> {
  try {
    const collectionData: MedalCollectionInsertInput = {
      user_id: userId,
      medal_no: medalNo,
    };

    const { data, error } = await supabase
      .from('medal_collections')
      .insert(collectionData)
      .select()
      .single();

    if (error) {
      // UNIQUE制約エラー（既に獲得済み）の場合
      if (error.code === '23505') {
        throw new Error('既に獲得済みです');
      }
      console.error('Collect medal error:', error);
      throw new Error('獲得に失敗しました。再度お試しください。');
    }

    if (!data) {
      throw new Error('獲得に失敗しました。');
    }

    return data;
  } catch (error) {
    console.error('Collect medal error:', error);
    throw error;
  }
}

/**
 * メダルの獲得をキャンセル（冒険モード）
 * @param userId ユーザーID
 * @param medalNo メダル番号
 * @returns void
 */
export async function uncollectMedal(
  userId: string,
  medalNo: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('medal_collections')
      .delete()
      .eq('user_id', userId)
      .eq('medal_no', medalNo);

    if (error) {
      console.error('Uncollect medal error:', error);
      throw new Error('獲得キャンセルに失敗しました。再度お試しください。');
    }
  } catch (error) {
    console.error('Uncollect medal error:', error);
    throw error;
  }
}

/**
 * ユーザーの獲得メダル一覧を取得
 * @param userId ユーザーID
 * @returns 獲得メダル配列
 */
export async function getUserCollections(userId: string): Promise<MedalCollection[]> {
  try {
    const { data, error } = await supabase
      .from('medal_collections')
      .select('*')
      .eq('user_id', userId)
      .order('collected_at', { ascending: false });

    if (error) {
      console.error('Get user collections error:', error);
      throw new Error('獲得メダル一覧の取得に失敗しました');
    }

    return data || [];
  } catch (error) {
    console.error('Get user collections error:', error);
    throw error;
  }
}

/**
 * ユーザーが特定のメダルを獲得済みかチェック
 * @param userId ユーザーID
 * @param medalNo メダル番号
 * @returns 獲得済みならtrue
 */
export async function isMedalCollected(
  userId: string,
  medalNo: number
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('medal_collections')
      .select('collection_id')
      .eq('user_id', userId)
      .eq('medal_no', medalNo)
      .limit(1);

    if (error) {
      console.error('Check medal collected error:', error);
      throw new Error('獲得状態の確認に失敗しました');
    }

    return (data && data.length > 0) || false;
  } catch (error) {
    console.error('Check medal collected error:', error);
    throw error;
  }
}
