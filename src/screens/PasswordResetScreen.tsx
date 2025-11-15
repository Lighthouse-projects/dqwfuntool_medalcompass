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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput } from '../components/common/TextInput';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail } from '../utils/validation';

interface PasswordResetScreenProps {
  navigation: any;
}

export const PasswordResetScreen: React.FC<PasswordResetScreenProps> = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // パスワードリセット送信処理
  const handleResetPassword = async () => {
    // バリデーション
    const emailValidation = validateEmail(email);
    setEmailError(emailValidation);

    if (emailValidation) {
      return;
    }

    // パスワードリセット送信
    try {
      setLoading(true);
      await resetPassword(email);
      Alert.alert(
        '送信完了',
        'パスワードリセット用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。',
        [
          {
            text: 'OK',
            onPress: () => {
              // 3秒後にログイン画面に戻る
              setTimeout(() => {
                navigation.navigate('Login');
              }, 100);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('エラー', (error as Error).message);
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
        <View style={[styles.content, { paddingTop: 20 + insets.top }]}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>パスワードリセット</Text>
          </View>

          {/* 説明文 */}
          <Text style={styles.description}>
            登録済みのメールアドレスを入力してください。{'\n'}
            パスワードリセット用のリンクが送信されます。
          </Text>

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

          {/* 送信ボタン */}
          <Button
            title="送信"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.sendButton}
          />
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
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
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
  description: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 21,
    marginBottom: 24,
  },
  sendButton: {
    marginTop: 8,
  },
});
