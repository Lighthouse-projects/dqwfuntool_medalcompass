import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, FONT_SIZES, SIZES, BORDER_RADIUS } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
  style,
  ...rest
}) => {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.BACKGROUND : COLORS.PRIMARY} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isPrimary ? styles.primaryButtonText : styles.secondaryButtonText,
            isDisabled && styles.disabledButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: SIZES.BUTTON_HEIGHT,
    borderRadius: BORDER_RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.TRANSPARENT,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  disabledButton: {
    backgroundColor: COLORS.PLACEHOLDER,
    borderColor: COLORS.PLACEHOLDER,
  },
  buttonText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: COLORS.BACKGROUND,
  },
  secondaryButtonText: {
    color: COLORS.TEXT_SECONDARY,
  },
  disabledButtonText: {
    color: COLORS.BACKGROUND,
  },
});
