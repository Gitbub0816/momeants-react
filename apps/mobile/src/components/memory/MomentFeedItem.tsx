import { Ionicons } from '@expo/vector-icons';
import { Glyph } from '../core/Glyph';
import React, { useState, useEffect } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { Moment } from '@momeants/types';
import type { FeedEngagementPrompt } from '@momeants/types';
import { MoodPill } from './MoodPill';
import { CircleAvatar } from '../circle/CircleAvatar';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';
import { useApi } from '../../context/ApiContext';

const { width: W, height: H } = Dimensions.get('window');
export const FEED_ITEM_HEIGHT = H;

const REACTIONS = ['heart', 'sparkles', 'moon', 'happy-outline', 'flame'];
// Tab bar: bottom:20 + height:78 = 98px from bottom. Add 16px clearance.
const TAB_CLEARANCE = 114;

interface Props {
  moment: Moment;
  isActive: boolean;
  resurfaceLabel?: string;
  engagementPrompts?: FeedEngagementPrompt[];
}

export function MomentFeedItem({ moment, isActive, resurfaceLabel, engagementPrompts }: Props) {
  const router = useRouter();
  const api = useApi();
  const [reactions, setReactions] = useState(moment.reactions);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Ken Burns: the active photo drifts imperceptibly larger over ~9s.
  // Metadata rises in softly as the card takes the stage.
  const kenBurns = useSharedValue(1);
  const metaIn = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      kenBurns.value = 1;
      kenBurns.value = withTiming(1.07, { duration: 9000, easing: Easing.out(Easing.quad) });
      metaIn.value = 0;
      metaIn.value = withDelay(120, withSpring(1, { damping: 18, stiffness: 120 }));
    } else {
      metaIn.value = 0;
    }
  }, [isActive]);

  const photoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: kenBurns.value }],
  }));
  const metaStyle = useAnimatedStyle(() => ({
    opacity: metaIn.value,
    transform: [{ translateY: 26 * (1 - metaIn.value) }],
  }));

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
      {/* Full-bleed photo with slow Ken Burns drift */}
      <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
        <Image
          source={{ uri: moment.imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={isActive ? 350 : 0}
        />
      </Animated.View>

      {/* Gradient: subtle top vignette + strong bottom */}
      <LinearGradient
        colors={['rgba(5,7,17,0.5)', 'transparent', 'transparent', 'rgba(5,7,17,0.35)', 'rgba(5,7,17,0.85)', 'rgba(5,7,17,0.97)']}
        locations={[0, 0.16, 0.5, 0.68, 0.86, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Resurfaced badge */}
      {(resurfaceLabel || (moment.isResurfaced && moment.resurfaceLabel)) && (
        <View style={styles.resurfaceBadge}>
          <Text style={styles.resurfaceText}><Ionicons name="sparkles" size={11} color={colors.auraLavender} /> {resurfaceLabel ?? moment.resurfaceLabel}</Text>
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
          <Glyph value={myReaction?.emoji ?? 'heart-outline'} size={20} color={myReaction ? colors.love : colors.textSecondary} />
          <Text style={[styles.toolbarCount, myReaction && { color: colors.auraPurple }]}>
            {totalReactions > 0 ? totalReactions : ''}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity onPress={openComments} style={styles.toolbarBtn} accessibilityLabel="Comments">
          <Ionicons name="chatbubble-outline" size={19} color={colors.textSecondary} />
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
          <Ionicons name="flash-outline" size={19} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={styles.toolbarBtn}
          accessibilityLabel="Share"
        >
          <Ionicons name="paper-plane-outline" size={19} color={colors.textSecondary} />
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
              <Glyph value={emoji} size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom-left metadata */}
      <Animated.View style={[styles.bottomMeta, { bottom: TAB_CLEARANCE }, metaStyle]}>
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
          <Text style={styles.location}><Ionicons name="location-outline" size={12} color={colors.textMuted} /> {moment.location.label}</Text>
        )}
      </Animated.View>
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
    gap: 26,
  },
  toolbarBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(12,16,32,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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
    position: 'absolute',
    bottom: -16,
    color: colors.textPrimary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    color: 'rgba(248,244,255,0.66)',
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    letterSpacing: 2.2,
  },
  caption: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
