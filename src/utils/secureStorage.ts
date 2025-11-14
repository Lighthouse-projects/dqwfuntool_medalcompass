import * as SecureStore from 'expo-secure-store';

// SecureStoreのキー名
const KEYS = {
  EMAIL: 'saved_email',
  PASSWORD: 'saved_password',
  REMEMBER_ME: 'remember_credentials',
} as const;

/**
 * ログイン情報を保存
 */
export async function saveCredentials(
  email: string,
  password: string
): Promise<void> {
  try {
    // データサイズチェック（2048バイト制限）
    const emailSize = new TextEncoder().encode(email).length;
    const passwordSize = new TextEncoder().encode(password).length;

    if (emailSize > 2048) {
      console.warn('Email is too large to store in SecureStore');
      return;
    }

    if (passwordSize > 2048) {
      console.warn('Password is too large to store in SecureStore');
      return;
    }

    await SecureStore.setItemAsync(KEYS.EMAIL, email);
    await SecureStore.setItemAsync(KEYS.PASSWORD, password);
    await SecureStore.setItemAsync(KEYS.REMEMBER_ME, 'true');
  } catch (error) {
    console.error('Failed to save credentials:', error);
    // エラーを無視（ログイン機能に影響させない）
  }
}

/**
 * ログイン情報を取得
 */
export async function getCredentials(): Promise<{
  email: string | null;
  password: string | null;
  rememberMe: boolean;
}> {
  try {
    const rememberMe = await SecureStore.getItemAsync(KEYS.REMEMBER_ME);

    if (rememberMe !== 'true') {
      return { email: null, password: null, rememberMe: false };
    }

    const email = await SecureStore.getItemAsync(KEYS.EMAIL);
    const password = await SecureStore.getItemAsync(KEYS.PASSWORD);

    return {
      email,
      password,
      rememberMe: true,
    };
  } catch (error) {
    console.error('Failed to get credentials:', error);
    // エラーを無視（空欄でログイン画面表示）
    return { email: null, password: null, rememberMe: false };
  }
}

/**
 * ログイン情報を削除
 */
export async function clearCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEYS.EMAIL);
    await SecureStore.deleteItemAsync(KEYS.PASSWORD);
    await SecureStore.deleteItemAsync(KEYS.REMEMBER_ME);
  } catch (error) {
    console.error('Failed to clear credentials:', error);
    // エラーを無視
  }
}

/**
 * 記憶機能の状態を取得
 */
export async function getRememberMeStatus(): Promise<boolean> {
  try {
    const rememberMe = await SecureStore.getItemAsync(KEYS.REMEMBER_ME);
    return rememberMe === 'true';
  } catch (error) {
    console.error('Failed to get remember me status:', error);
    return false;
  }
}
