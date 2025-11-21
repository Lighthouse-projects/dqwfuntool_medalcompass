import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput } from '../components/common/TextInput';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
} from '../utils/validation';

interface SignUpScreenProps {
  navigation: any;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordConfirmError, setPasswordConfirmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 新規登録処理
  const handleSignUp = async () => {
    // バリデーション
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const passwordConfirmValidation = validatePasswordConfirm(password, passwordConfirm);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    setPasswordConfirmError(passwordConfirmValidation);

    if (emailValidation || passwordValidation || passwordConfirmValidation) {
      return;
    }

    // 新規登録実行
    try {
      setLoading(true);
      await signUp(email, password);
      Alert.alert(
        '登録完了',
        '確認メールを送信しました。メール内のリンクをクリックして認証を完了してください。',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('登録エラー', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/00047-3696380417.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, { paddingTop: 20 }]}>
            {/* ヘッダー */}
            <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>新規登録</Text>
          </View>

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
            label="パスワード（6文字以上）"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(null);
            }}
            placeholder="••••••"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            error={passwordError}
          />

          {/* パスワード確認入力 */}
          <TextInput
            label="パスワード（確認）"
            value={passwordConfirm}
            onChangeText={(text) => {
              setPasswordConfirm(text);
              setPasswordConfirmError(null);
            }}
            placeholder="••••••"
            secureTextEntry
            autoCapitalize="none"
            error={passwordConfirmError}
          />

          {/* 登録ボタン */}
          <Button
            title="登録"
            onPress={handleSignUp}
            loading={loading}
            style={styles.signUpButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#212121',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  signUpButton: {
    marginTop: 24,
  },
});
