import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { SparkDelivery } from '@momeants/types';
import { colors, fontFamily, fontSize, spacing, radii, spring } from '@momeants/design';
import { SpringPressable } from '../core/SpringPressable';
import { sparkCategoryMeta } from './sparkCategoryMeta';

interface SparkPillProps {
  delivery: SparkDelivery;
  onPress: (delivery: SparkDelivery) => void;
  /** Stagger index for entrance animation. */
  index?: number;
  style?: ViewStyle;
}

// A spark rendered as a compact, floating glass widget-pill with a glowing
// gradient border keyed to its category. Springs in on mount (staggered).
export function SparkPill({ delivery, onPress, index = 0, style }: SparkPillProps) {
  const { spark } = delivery;
  const meta = sparkCategoryMeta(spark?.category);
  const hook = spark?.description ?? spark?.title ?? 'A little spark to connect.';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80)
        .springify()
        .damping(spring.damping)
        .stiffness(spring.stiffness)
        .mass(spring.mass)}
      style={style}
    >
      <SpringPressable
        pressScale={0.97}
        haptic={false}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(delivery);
        }}
        accessibilityRole="button"
        accessibilityLabel={spark?.title ?? 'Spark'}
        style={[styles.shadow, { shadowColor: meta.accent }]}
      >
        <LinearGradient
          colors={[meta.gradient[0] + '66', meta.gradient[1] + '22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.borderWrap}
        >
          <View style={styles.inner}>
            <View style={[styles.iconHalo, { backgroundColor: meta.accent + '22', borderColor: meta.accent + '55' }]}>
              <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={18} color={meta.accent} />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.title} numberOfLines={1}>
                {spark?.title ?? 'Spark'}
              </Text>
              <Text style={styles.hook} numberOfLines={1}>
                {hook}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </LinearGradient>
      </SpringPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radii.full,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  borderWrap: {
    borderRadius: radii.full,
    padding: 1.5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.glass900,
    minHeight: 56,
  },
  iconHalo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textBlock: { flex: 1 },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.body,
  },
  hook: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    marginTop: 1,
  },
});
