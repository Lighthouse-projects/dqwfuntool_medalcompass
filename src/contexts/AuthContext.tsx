import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContextType, AuthState } from '../types/auth';
import { supabase } from '../lib/supabase';
import { AuthError } from '@supabase/supabase-js';
import { getRememberMeStatus, clearCredentials } from '../utils/secureStorage';

// AuthContextの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// エラーメッセージのマッピング
const getErrorMessage = (error: AuthError): string => {
  const errorMessages: { [key: string]: string } = {
    'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
    'User already registered': 'このメールアドレスは既に登録されています',
    'Password should be at least 8 characters': 'パスワードは8文字以上で入力してください',
    'Unable to validate email address': '有効なメールアドレスを入力してください',
    'Email not confirmed': 'メールアドレスが認証されていません。確認メールをご確認ください',
  };

  return errorMessages[error.message] || '通信エラーが発生しました。しばらくしてから再度お試しください';
};

// AuthProviderコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // セッション復元（アプリ起動時）
  useEffect(() => {
    // 初期セッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session: session,
        loading: false,
        error: null,
      });
    });

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session: session,
        loading: false,
      }));
    });

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ログイン処理
  const signIn = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // セッションは onAuthStateChange で自動更新される
    } catch (error) {
      const errorMessage = getErrorMessage(error as AuthError);
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  };

  // 新規登録処理
  const signUp = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 登録成功（確認メール送信済み）
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage = getErrorMessage(error as AuthError);
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  };

  // ログアウト処理
  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // 記憶機能がOFFの場合、保存情報をクリア
      const rememberMe = await getRememberMeStatus();
      if (!rememberMe) {
        await clearCredentials();
      }

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // セッションは onAuthStateChange で自動更新される
    } catch (error) {
      const errorMessage = getErrorMessage(error as AuthError);
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  };

  // パスワードリセット送信
  const resetPassword = async (email: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage = getErrorMessage(error as AuthError);
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuthフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
