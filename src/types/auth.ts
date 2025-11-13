import { User, Session } from '@supabase/supabase-js';

// 認証状態の型定義
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

// 認証コンテキストの型定義
export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// ログインフォームの型定義
export interface LoginFormData {
  email: string;
  password: string;
}

// サインアップフォームの型定義
export interface SignUpFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  agreedToTerms: boolean;
}

// パスワードリセットフォームの型定義
export interface PasswordResetFormData {
  email: string;
}
