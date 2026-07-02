import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows, fontFamily, fontSize, gradients } from '@momeants/design';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  home: { label: 'Home', icon: 'home-outline', iconActive: 'home' },
  timeline: { label: 'Timeline', icon: 'time-outline', iconActive: 'time' },
  circle: { label: 'Circle', icon: 'people-outline', iconActive: 'people' },
  you: { label: 'You', icon: 'person-circle-outline', iconActive: 'person-circle' },
};

// Routes that exist under (tabs) but are reached from elsewhere in the UI
const HIDDEN_TABS = new Set(['messages', 'calendar']);

export function MomeantsTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          if (HIDDEN_TABS.has(route.name)) return null;
          const isFocused = state.index === index;
          const isCapture = route.name === 'capture';

          function onPress() {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          if (isCapture) {
            // Push the full-screen capture modal directly — never navigate to
            // the capture tab route (a redirect there causes an infinite loop).
            const openCapture = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/capture');
            };
            return (
              <View key={route.key} style={styles.captureWrapper}>
                <View style={styles.captureGlow} />
                <TouchableOpacity
                  onPress={openCapture}
                  accessibilityRole="button"
                  accessibilityLabel="Capture a moment"
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={gradients.aura}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.captureButton}
                  >
                    <Ionicons name="add" size={30} color={colors.textPrimary} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          }

          const tab = TABS[route.name];
          if (!tab) return null;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isFocused }}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? tab.iconActive : tab.icon}
                size={22}
                color={isFocused ? colors.auraLavender : colors.textMuted}
              />
              <Text style={[styles.label, isFocused && styles.labelFocused]}>{tab.label}</Text>
              {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
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
    backgroundColor: 'rgba(181,124,255,0.22)',
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
