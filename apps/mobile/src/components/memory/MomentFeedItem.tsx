import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { Moment } from '@momeants/types';
import { MoodPill } from './MoodPill';
import { CircleAvatar } from '../circle/CircleAvatar';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';
import { useApi } from '../../context/ApiContext';

const { width: W, height: H } = Dimensions.get('window');
export const FEED_ITEM_HEIGHT = H;

const REACTIONS = ['❤️', '✨', '🌙', '😌', '🔥'];
// Tab bar: bottom:20 + height:78 = 98px from bottom. Add 16px clearance.
const TAB_CLEARANCE = 114;

interface Props {
  moment: Moment;
  isActive: boolean;
}

export function MomentFeedItem({ moment, isActive }: Props) {
  const router = useRouter();
  const api = useApi();
  const [reactions, setReactions] = useState(moment.reactions);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const date = new Date(moment.createdAt)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const myReaction = reactions.find((r) => r.reactedByMe);

  async function handleReact(emoji: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setReactions((prev) =>
      prev.map((r) =>
        r.emoji === emoji
          ? { ...r, count: r.reactedByMe ? r.count - 1 : r.count + 1, reactedByMe: !r.reactedByMe }
          : { ...r, reactedByMe: false }
      )
    );
    setShowReactionPicker(false);
    await api.reactToMoment(moment.id, emoji);
  }

  function openComments() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/moment/${moment.id}`);
  }

  return (
    <View style={styles.container}>
      {/* Full-bleed photo */}
      <Image
        source={{ uri: moment.imageUri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={isActive ? 200 : 0}
      />

      {/* Gradient: subtle top vignette + strong bottom */}
      <LinearGradient
        colors={['rgba(5,7,17,0.45)', 'transparent', 'transparent', 'rgba(5,7,17,0.72)', 'rgba(5,7,17,0.92)']}
        locations={[0, 0.15, 0.55, 0.82, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Resurfaced badge */}
      {moment.isResurfaced && moment.resurfaceLabel && (
        <View style={styles.resurfaceBadge}>
          <Text style={styles.resurfaceText}>✦ {moment.resurfaceLabel}</Text>
        </View>
      )}

      {/* Right-side toolbar */}
      <View style={[styles.rightToolbar, { bottom: TAB_CLEARANCE + 16 }]}>
        {/* React */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowReactionPicker((v) => !v);
          }}
          style={styles.toolbarBtn}
          accessibilityLabel="React"
        >
          <Text style={styles.toolbarEmoji}>{myReaction?.emoji ?? '❤️'}</Text>
          <Text style={[styles.toolbarCount, myReaction && { color: colors.auraPurple }]}>
            {totalReactions > 0 ? totalReactions : ''}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity onPress={openComments} style={styles.toolbarBtn} accessibilityLabel="Comments">
          <Text style={styles.toolbarEmoji}>💬</Text>
          <Text style={styles.toolbarCount}>
            {moment.comments.length > 0 ? moment.comments.length : ''}
          </Text>
        </TouchableOpacity>

        {/* Spark */}
        <TouchableOpacity
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={styles.toolbarBtn}
          accessibilityLabel="Spark"
        >
          <Text style={styles.toolbarEmoji}>⚡</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={styles.toolbarBtn}
          accessibilityLabel="Share"
        >
          <Text style={styles.toolbarSymbol}>↗</Text>
        </TouchableOpacity>
      </View>

      {/* Reaction picker popover */}
      {showReactionPicker && (
        <View style={[styles.reactionPicker, { bottom: TAB_CLEARANCE + 80 }]}>
          {REACTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => handleReact(emoji)}
              style={styles.reactionPickerBtn}
              accessibilityLabel={`React with ${emoji}`}
            >
              <Text style={styles.reactionPickerEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom-left metadata */}
      <View style={[styles.bottomMeta, { bottom: TAB_CLEARANCE }]}>
        {/* Tagged people */}
        {moment.people.length > 0 && (
          <View style={styles.peopleRow}>
            {moment.people.slice(0, 3).map((p) => (
              <CircleAvatar key={p.id} name={p.name} avatarUri={p.avatarUri} size={26} />
            ))}
            <Text style={styles.peopleNames} numberOfLines={1}>
              {moment.people.map((p) => p.name.split(' ')[0]).join(', ')}
            </Text>
          </View>
        )}

        {/* Date */}
        <Text style={styles.date}>{date}</Text>

        {/* Caption */}
        {moment.caption ? (
          <Text style={styles.caption} numberOfLines={4}>
            {moment.caption}
          </Text>
        ) : null}

        {/* Moods */}
        {moment.moods.length > 0 && (
          <View style={styles.moodsRow}>
            {moment.moods.slice(0, 3).map((mood) => (
              <MoodPill key={mood} mood={mood} />
            ))}
          </View>
        )}

        {/* Location */}
        {moment.location && (
          <Text style={styles.location}>📍 {moment.location.label}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: W,
    height: H,
    backgroundColor: colors.ink900,
  },
  resurfaceBadge: {
    position: 'absolute',
    top: (StatusBar.currentHeight ?? 44) + 60,
    left: spacing.lg,
    backgroundColor: 'rgba(181,124,255,0.22)',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.auraPurple,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  resurfaceText: {
    color: colors.auraPurple,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    letterSpacing: 0.4,
  },
  rightToolbar: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'center',
    gap: spacing.xl,
  },
  toolbarBtn: {
    alignItems: 'center',
    gap: 3,
    minHeight: 44,
    justifyContent: 'center',
  },
  toolbarEmoji: {
    fontSize: 30,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  toolbarSymbol: {
    fontSize: 26,
    color: colors.textPrimary,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  toolbarCount: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    minHeight: 14,
  },
  reactionPicker: {
    position: 'absolute',
    right: 70,
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(9,12,24,0.90)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionPickerBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionPickerEmoji: { fontSize: 26 },
  bottomMeta: {
    position: 'absolute',
    left: spacing.lg,
    right: 72,
    gap: spacing.xs,
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  peopleNames: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
    marginLeft: 4,
    flexShrink: 1,
  },
  date: {
    color: 'rgba(248,244,255,0.55)',
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    letterSpacing: 1.2,
  },
  caption: {
    color: colors.textPrimary,
    fontFamily: fontFamily.serifRegular,
    fontSize: 19,
    lineHeight: 27,
  },
  moodsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  location: {
    color: 'rgba(248,244,255,0.5)',
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
  },
});
