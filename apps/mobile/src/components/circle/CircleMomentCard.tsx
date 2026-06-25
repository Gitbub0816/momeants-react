import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { CircleMoment } from '@momeants/types';
import { colors, gradients, radii, fontFamily, fontSize, spacing } from '@momeants/design';
import { CircleAvatar } from './CircleAvatar';

interface Props {
  circleMoment: CircleMoment;
  onPress?: () => void;
}

export function CircleMomentCard({ circleMoment, onPress }: Props) {
  const timeAgo = formatTimeAgo(circleMoment.createdAt);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${circleMoment.authorName}'s moment: ${circleMoment.caption ?? ''}`}
    >
      <Image
        source={{ uri: circleMoment.thumbnailUri ?? circleMoment.imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient colors={gradients.subtleOverlay} style={styles.overlay}>
        <View style={styles.header}>
          <CircleAvatar
            name={circleMoment.authorName}
            avatarUri={circleMoment.authorAvatarUri}
            size={32}
          />
          <View style={styles.headerText}>
            <Text style={styles.authorName}>{circleMoment.authorName}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>
        {circleMoment.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {circleMoment.caption}
          </Text>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    height: 280,
    backgroundColor: colors.ink800,
  },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerText: { flex: 1 },
  authorName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
  timeAgo: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.micro,
  },
  caption: {
    color: colors.textPrimary,
    fontFamily: fontFamily.serifRegular,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
});
