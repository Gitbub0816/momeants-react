import { Ionicons } from '@expo/vector-icons';
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
import { colors } from '@momeants/design';
import { spacing, radii } from '@momeants/design';
import { fontSize, fontFamily } from '@momeants/design';
import { sparkCategoryMeta } from './sparkCategoryMeta';

interface SparkCardProps {
  delivery: SparkDelivery;
  onAccept: (deliveryId: string) => void;
  onDismiss: (deliveryId: string) => void;
}

export function SparkCard({ delivery, onAccept, onDismiss }: SparkCardProps) {
  const router = useRouter();
  const { spark } = delivery;
  const meta = sparkCategoryMeta(spark.category);

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
            accessibilityLabel="Dismiss Spark"
          >
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={[styles.iconHalo, { backgroundColor: meta.accent + '22', borderColor: meta.accent + '55' }]}>
            <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={20} color={meta.accent} />
          </View>
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
            <Text style={styles.acceptText}>Start the Spark</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
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
    fontSize: fontSize.section,
    fontFamily: fontFamily.serif,
    marginBottom: 4,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sans,
    lineHeight: 20,
  },
  reason: {
    color: colors.auraPurple,
    fontSize: fontSize.micro,
    fontFamily: fontFamily.sans,
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
    fontSize: fontSize.micro,
    fontFamily: fontFamily.sans,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: fontSize.micro,
  },
  acceptButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  acceptGradient: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHalo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2,
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: fontSize.body,
    fontFamily: fontFamily.sansMedium,
  },
});
