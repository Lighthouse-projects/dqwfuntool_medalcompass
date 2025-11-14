import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { TextInput } from '../components/common/TextInput';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';
import {
  saveCredentials,
  getCredentials,
  clearCredentials,
} from '../utils/secureStorage';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 画面表示時: 保存された情報を読み込み
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    const credentials = await getCredentials();
    if (credentials.rememberMe && credentials.email && credentials.password) {
      setEmail(credentials.email);
      setPassword(credentials.password);
      setRememberMe(true);
    }
  };

  // ログイン処理
  const handleLogin = async () => {
    // バリデーション
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    // ログイン実行
    try {
      setLoading(true);
      await signIn(email, password);

      // ログイン成功時: チェックボックスがONなら保存、OFFならクリア
      if (rememberMe) {
        await saveCredentials(email, password);
      } else {
        await clearCredentials();
      }

      // 成功時の画面遷移は AuthContext の onAuthStateChange で自動的に行われる
    } catch (error) {
      Alert.alert('ログインエラー', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* タイトル */}
          <Text style={styles.title}>dqwfunメダルコンパス</Text>

          {/* メールアドレス入力 */}
          <TextInput
            label="メールアドレス"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(null);
            }}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={emailError}
          />

          {/* パスワード入力 */}
          <TextInput
            label="パスワード"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(null);
            }}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            error={passwordError}
          />

          {/* ログイン情報を記憶するチェックボックス */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? '#1E88E5' : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.checkboxLabel}>ログイン情報を記憶する</Text>
          </View>

          {/* ログインボタン */}
          <Button
            title="ログイン"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          {/* リンク */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}>新規登録はこちら</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
              <Text style={styles.linkText}>パスワードを忘れた方</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 40,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#212121',
  },
  loginButton: {
    marginTop: 8,
  },
  linksContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#1E88E5',
    textDecorationLine: 'none',
  },
});
