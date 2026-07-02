import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Moment } from '@momeants/types';
import { colors, gradients, radii, fontFamily, fontSize, spacing, shadows } from '@momeants/design';
import { MoodPill } from './MoodPill';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.lg * 2;
const CARD_HEIGHT = 420;

interface Props {
  moment: Moment;
}

export function MemoryHeroCard({ moment }: Props) {
  const router = useRouter();

  function handlePress() {
    router.push(`/moment/${moment.id}`);
  }

  const date = new Date(moment.createdAt);
  const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`Memory: ${moment.caption ?? 'Untitled moment'}`}
      style={[styles.card, shadows.card]}
    >
      <Image
        source={{ uri: moment.imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={gradients.cardOverlay}
        locations={[0, 0.45, 1]}
        style={styles.overlay}
      >
        <View style={styles.content}>
          {moment.isResurfaced && moment.resurfaceLabel && (
            <View style={styles.resurfaceBadge}>
              <Ionicons name="sparkles" size={11} color={colors.auraPurple} />
              <Text style={styles.resurfaceText}>{moment.resurfaceLabel}</Text>
            </View>
          )}
          <Text style={styles.date}>{dateLabel}</Text>
          {moment.caption ? (
            <Text style={styles.caption} numberOfLines={3}>
              {moment.caption}
            </Text>
          ) : null}
          <View style={styles.moods}>
            {moment.moods.slice(0, 3).map((mood) => (
              <MoodPill key={mood} mood={mood} style={styles.moodPill} />
            ))}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    backgroundColor: colors.ink800,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  resurfaceBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(181, 124, 255, 0.2)',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.auraPurple,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  resurfaceText: {
    color: colors.auraPurple,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    letterSpacing: 0.3,
  },
  date: {
    color: colors.textMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    letterSpacing: 1.2,
  },
  caption: {
    color: colors.textPrimary,
    fontFamily: fontFamily.serifRegular,
    fontSize: fontSize.title,
    lineHeight: 30,
  },
  moods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  moodPill: {},
});
