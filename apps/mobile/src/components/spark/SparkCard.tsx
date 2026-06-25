import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { SparkDelivery } from '@momeants/types';
import { colors } from '@momeants/design/src/colors';
import { spacing, radii } from '@momeants/design/src/spacing';
import { fontSize, fontFamily } from '@momeants/design/src/typography';

const CATEGORY_ICON: Record<string, string> = {
  conversation: '💬',
  memory: '✨',
  relationship: '🤝',
  holiday: '🎉',
  anniversary: '🎂',
  seasonal: '🌿',
  location: '📍',
  family: '👨‍👩‍👧',
  friendship: '🫂',
  couple: '💑',
  clique: '🙌',
  photo: '📸',
  storytelling: '📖',
  creative: '🎨',
  discovery: '🔍',
};

interface SparkCardProps {
  delivery: SparkDelivery;
  onAccept: (deliveryId: string) => void;
  onDismiss: (deliveryId: string) => void;
}

export function SparkCard({ delivery, onAccept, onDismiss }: SparkCardProps) {
  const router = useRouter();
  const { spark } = delivery;
  const icon = CATEGORY_ICON[spark.category] ?? '✨';

  const handleAccept = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAccept(delivery.id);
    router.push(`/spark/${delivery.id}`);
  };

  const handleDismiss = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss(delivery.id);
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['rgba(181,124,255,0.18)', 'rgba(120,167,255,0.10)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TODAY'S SPARK</Text>
          </View>
          <Pressable
            onPress={handleDismiss}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Dismiss spark"
          >
            <Text style={styles.dismissIcon}>×</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{spark.title}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {spark.description}
            </Text>
            {delivery.recommendationReason ? (
              <Text style={styles.reason}>{delivery.recommendationReason}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaText}>~{spark.estimatedMinutes} min</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{spark.minPlayers}+ people</Text>
        </View>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAccept}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Start this spark"
        >
          <LinearGradient
            colors={[colors.auraPurple, colors.auraBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.acceptGradient}
          >
            <Text style={styles.acceptText}>Start the Spark →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.30)',
  },
  gradient: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: 'rgba(181,124,255,0.20)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.auraPurple,
    fontSize: fontSize.micro,
    fontFamily: fontFamily.sansMedium,
    letterSpacing: 1.2,
  },
  dismissIcon: {
    color: colors.textMuted,
    fontSize: 22,
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 32,
    marginTop: 2,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.serifBold,
    marginBottom: 4,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.sans,
    lineHeight: 20,
  },
  reason: {
    color: colors.auraPurple,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.sansItalic ?? fontFamily.sans,
    marginTop: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.sans,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  acceptButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  acceptGradient: {
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontFamily: fontFamily.sansMedium,
  },
});
