import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows, fontFamily, fontSize, gradients } from '@momeants/design';

const TAB_ICONS: Record<string, string> = {
  home: '⌂',
  timeline: '◷',
  capture: '+',
  circle: '◎',
  messages: '💬',
  calendar: '📅',
  you: '○',
};

const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  timeline: 'Timeline',
  capture: 'Capture',
  circle: 'Circle',
  messages: 'Messages',
  calendar: 'Calendar',
  you: 'You',
};

export function MomeantsTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
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
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Capture a moment"
                style={styles.captureWrapper}
              >
                <LinearGradient
                  colors={gradients.aura}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.captureButton}
                >
                  <Text style={styles.captureIcon}>+</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityLabel={TAB_LABELS[route.name] ?? route.name}
              accessibilityState={{ selected: isFocused }}
              style={styles.tab}
            >
              <Text style={[styles.icon, isFocused && styles.iconFocused]}>
                {TAB_ICONS[route.name] ?? '·'}
              </Text>
              <Text style={[styles.label, isFocused && styles.labelFocused]}>
                {TAB_LABELS[route.name] ?? route.name}
              </Text>
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
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 13, 27, 0.82)',
    borderRadius: radii.xxl,
    height: 78,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  icon: {
    fontSize: 20,
    color: colors.textMuted,
  },
  iconFocused: {
    color: colors.auraPurple,
  },
  label: {
    fontSize: fontSize.micro,
    fontFamily: fontFamily.sans,
    color: colors.textMuted,
    marginTop: 2,
  },
  labelFocused: {
    color: colors.auraPurple,
    fontFamily: fontFamily.sansMedium,
  },
  captureWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  captureButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    ...shadows.captureButton,
  },
  captureIcon: {
    fontSize: 28,
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    lineHeight: 32,
  },
});
