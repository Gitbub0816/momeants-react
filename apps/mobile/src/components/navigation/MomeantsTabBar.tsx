import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { colors, radii, shadows, fontFamily, fontSize, gradients } from '@momeants/design';
import { SpringPressable } from '../core/SpringPressable';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  home: { label: 'Home', icon: 'home-outline', iconActive: 'home' },
  timeline: { label: 'Timeline', icon: 'time-outline', iconActive: 'time' },
  circle: { label: 'Circle', icon: 'people-outline', iconActive: 'people' },
  you: { label: 'You', icon: 'person-circle-outline', iconActive: 'person-circle' },
};

// Routes that exist under (tabs) but are reached from elsewhere in the UI
const HIDDEN_TABS = new Set(['messages', 'calendar']);

function TabItem({
  label,
  icon,
  iconActive,
  isFocused,
  onPress,
}: {
  label: string;
  icon: IconName;
  iconActive: IconName;
  isFocused: boolean;
  onPress: () => void;
}) {
  const lift = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    lift.value = withSpring(isFocused ? 1 : 0, { damping: 16, stiffness: 200 });
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * lift.value }, { scale: 1 + 0.08 * lift.value }],
  }));

  return (
    <SpringPressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={styles.tab}
      pressScale={0.9}
    >
      <Animated.View style={[styles.tabInner, iconStyle]}>
        <Ionicons
          name={isFocused ? iconActive : icon}
          size={22}
          color={isFocused ? colors.auraLavender : colors.textMuted}
        />
        <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
      </Animated.View>
      {isFocused && <Animated.View entering={FadeIn.duration(260)} style={styles.activeDot} />}
    </SpringPressable>
  );
}

function CaptureButton({ onPress }: { onPress: () => void }) {
  const breathe = useSharedValue(0);

  useEffect(() => {
    // A slow, candle-like breathing glow — alive, never busy
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + 0.45 * breathe.value,
    transform: [{ scale: 1 + 0.10 * breathe.value }],
  }));

  return (
    <View style={styles.captureWrapper}>
      <Animated.View style={[styles.captureGlow, glowStyle]} />
      <SpringPressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Capture a moment"
        pressScale={0.88}
        haptic={false}
      >
        <LinearGradient
          colors={gradients.aura}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.captureButton}
        >
          <Ionicons name="add" size={30} color={colors.textPrimary} />
        </LinearGradient>
      </SpringPressable>
    </View>
  );
}

// Fixed visual order; 'capture' is not a route — it pushes the modal directly.
const BAR_ORDER = ['home', 'timeline', 'capture', 'circle', 'you'];

export function MomeantsTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.bar}>
        {BAR_ORDER.map((name) => {
          if (name === 'capture') {
            return (
              <CaptureButton
                key="capture"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/capture');
                }}
              />
            );
          }

          const routeIndex = state.routes.findIndex((r) => r.name === name);
          if (routeIndex === -1) return null;
          const route = state.routes[routeIndex];
          const isFocused = state.index === routeIndex;
          const tab = TABS[name];
          if (!tab) return null;

          return (
            <TabItem
              key={route.key}
              label={tab.label}
              icon={tab.icon}
              iconActive={tab.iconActive}
              isFocused={isFocused}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 18,
    right: 18,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 13, 27, 0.92)',
    borderRadius: radii.xxl,
    height: 74,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    ...shadows.glow,
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 44,
    minWidth: 44,
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: fontSize.micro,
    fontFamily: fontFamily.sans,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  labelFocused: {
    color: colors.auraLavender,
    fontFamily: fontFamily.sansMedium,
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.auraPurple,
  },
  captureWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  captureGlow: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(181,124,255,0.24)',
  },
  captureButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    ...shadows.captureButton,
  },
});
