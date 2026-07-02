import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SpringPressableProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far the element sinks on press. 0.96 feels like glass, 0.9 like a button. */
  pressScale?: number;
  haptic?: boolean;
}

// The app's standard touchable: a soft physical spring on press with an
// optional haptic tick. Motion spec: damping 18, stiffness 220 — alive but calm.
export function SpringPressable({
  children,
  style,
  pressScale = 0.96,
  haptic = true,
  onPressIn,
  onPressOut,
  ...rest
}: SpringPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        scale.value = withSpring(pressScale, { damping: 18, stiffness: 220, mass: 0.6 });
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 14, stiffness: 180, mass: 0.6 });
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
