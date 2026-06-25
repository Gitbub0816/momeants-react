import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@momeants/design/src/colors';
import { radii } from '@momeants/design/src/spacing';

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height, borderRadius = radii.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as ViewStyle['width'], height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function HeroSkeleton() {
  return (
    <View style={styles.heroContainer}>
      <Skeleton height={420} borderRadius={radii.xl} />
    </View>
  );
}

export function MiniCardSkeleton() {
  return <Skeleton width={160} height={200} borderRadius={radii.lg} />;
}

export function CircleAvatarSkeleton() {
  return <Skeleton width={48} height={48} borderRadius={999} />;
}

export function HomeScreenSkeleton() {
  return (
    <View style={styles.homeSkeleton}>
      <Skeleton width={140} height={28} borderRadius={radii.sm} style={styles.wordmark} />
      <HeroSkeleton />
      <View style={styles.circleRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.circleItem}>
            <CircleAvatarSkeleton />
            <Skeleton width={40} height={10} borderRadius={radii.xs} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
      <View style={styles.miniRow}>
        {[0, 1, 2].map((i) => (
          <MiniCardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContainer: {
    paddingHorizontal: 16,
  },
  homeSkeleton: {
    flex: 1,
    gap: 24,
    paddingTop: 16,
  },
  wordmark: {
    marginLeft: 20,
  },
  circleRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
  },
  circleItem: {
    alignItems: 'center',
    gap: 6,
  },
  miniRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
});
