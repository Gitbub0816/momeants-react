import React from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { SpringPressable } from './SpringPressable';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients, radii, fontFamily, fontSize } from '@momeants/design';

type Variant = 'primary' | 'glass' | 'quiet' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function MomeantsButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: Props) {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <SpringPressable
        pressScale={0.955}
        haptic={false}
        onPress={handlePress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.base, isDisabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={gradients.aura}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientFill}
        >
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={[styles.textPrimary, textStyle]}>{label}</Text>
          )}
        </LinearGradient>
      </SpringPressable>
    );
  }

  const variantStyle = variant === 'glass' ? styles.glass : variant === 'danger' ? styles.danger : styles.quiet;
  const variantText = variant === 'danger' ? styles.textDanger : styles.textSecondary;

  return (
    <SpringPressable
      pressScale={0.955}
      haptic={false}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.base, variantStyle, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : (
        <Text style={[variantText, textStyle]}>{label}</Text>
      )}
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.full,
    overflow: 'hidden',
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientFill: {
    width: '100%',
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  glass: {
    backgroundColor: colors.glass700,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
  },
  quiet: {
    paddingHorizontal: 24,
  },
  danger: {
    backgroundColor: 'rgba(255, 107, 122, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 24,
  },
  disabled: { opacity: 0.45 },
  textPrimary: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.body,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.body,
  },
  textDanger: {
    color: colors.danger,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.body,
  },
});
