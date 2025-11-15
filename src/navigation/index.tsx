import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { PasswordResetScreen } from '../screens/PasswordResetScreen';
import { MainNavigator } from './MainNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// ナビゲーションの型定義
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  PasswordReset: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();

// 認証スタック（ログイン前）
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="PasswordReset" component={PasswordResetScreen} />
  </AuthStack.Navigator>
);

// ルートナビゲーター
export const RootNavigator = () => {
  const { user, loading } = useAuth();

  // ローディング中
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
