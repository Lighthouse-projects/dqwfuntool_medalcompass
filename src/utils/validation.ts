// メールアドレスのバリデーション
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'メールアドレスを入力してください';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '有効なメールアドレスを入力してください';
  }

  return null;
};

// パスワードのバリデーション
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'パスワードを入力してください';
  }

  if (password.length < 4) {
    return 'パスワードは4文字以上で入力してください';
  }

  return null;
};

// パスワード確認のバリデーション
export const validatePasswordConfirm = (
  password: string,
  passwordConfirm: string
): string | null => {
  if (!passwordConfirm) {
    return 'パスワード（確認）を入力してください';
  }

  if (password !== passwordConfirm) {
    return 'パスワードが一致しません';
  }

  return null;
};

// 利用規約同意のバリデーション
export const validateTermsAgreement = (agreed: boolean): string | null => {
  if (!agreed) {
    return '利用規約に同意してください';
  }

  return null;
};
