import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Moment } from '@momeants/types';
import { colors, gradients, radii, fontFamily, fontSize, spacing } from '@momeants/design';

interface Props {
  moment: Moment;
}

export function MemoryMiniCard({ moment }: Props) {
  const router = useRouter();

  const date = new Date(moment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      onPress={() => router.push(`/moment/${moment.id}`)}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Memory from ${date}: ${moment.caption ?? ''}`}
      style={styles.card}
    >
      <Image
        source={{ uri: moment.thumbnailUri ?? moment.imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient colors={gradients.subtleOverlay} style={styles.overlay}>
        <Text style={styles.date}>{date}</Text>
        {moment.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {moment.caption}
          </Text>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 200,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.ink800,
  },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.sm,
    gap: 2,
  },
  date: {
    color: colors.textMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    lineHeight: 17,
  },
});
