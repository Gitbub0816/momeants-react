import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { Moment, CircleMember } from '@momeants/types';
import { MoodPill } from '../../src/components/memory';
import { CircleAvatar } from '../../src/components/circle';
import { useApi } from '../../src/context/ApiContext';
import { colors, gradients, fontFamily, fontSize, spacing, radii } from '@momeants/design';
import { buildCommentNudge } from '../../src/engines/commentEngagementEngine';
import { DEMO_RELATIONSHIP_WEIGHTS } from '../../src/demo/relationships';

const { width, height } = Dimensions.get('window');
const REACTIONS = ['❤️', '✨', '🌙', '😌', '🔥'];

export default function MomentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentPrompts, setCommentPrompts] = useState<string[]>([]);
  const [shareVisible, setShareVisible] = useState(false);
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);
  const [sharedTo, setSharedTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) api.getMoment(id).then((m) => {
      setMoment(m);
      if (m && (m.moods.length > 0 || m.people.length > 0)) {
        const ctx = {
          userId: 'me',
          currentTime: new Date(),
          moments: [],
          circleMembers: [],
          cliques: [],
          circleMoments: [],
          conversations: [],
          sparkHistory: [],
          availableSparks: [],
          calendarEvents: [],
          seenFeedItemIds: new Set<string>(),
          dismissedSparkIds: new Set<string>(),
          seenSponsoredIds: new Map<string, number>(),
          relationshipWeights: DEMO_RELATIONSHIP_WEIGHTS,
          socialGraph: new Map(),
          sponsoredItems: [],
          discoveryMoments: [],
          userInterestSignals: [],
        };
        const nudge = buildCommentNudge(m, ctx);
        setCommentPrompts(nudge.prompts.slice(0, 3).map((p) => p.text));
      }
    });
  }, [id]);

  async function react(emoji: string) {
    if (!moment) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Optimistic update
    setMoment((prev) => {
      if (!prev) return prev;
      const existing = prev.reactions.find((r) => r.emoji === emoji);
      const wasReacted = existing?.reactedByMe ?? false;
      const updatedReactions = prev.reactions.map((r) =>
        r.emoji === emoji
          ? { ...r, reactedByMe: !wasReacted, count: wasReacted ? r.count - 1 : r.count + 1 }
          : r
      );
      if (!existing) {
        updatedReactions.push({ emoji, count: 1, reactedByMe: true });
      }
      return { ...prev, reactions: updatedReactions };
    });
    await api.reactToMoment(moment.id, emoji);
  }

  async function openShare() {
    if (circleMembers.length === 0) {
      const mems = await api.listCircleMembers();
      setCircleMembers(mems);
    }
    setShareVisible(true);
  }

  async function shareTo(userId: string) {
    if (!moment || sharedTo.has(userId)) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await api.shareMoment(moment.id, userId);
    setSharedTo((prev) => new Set([...prev, userId]));
  }

  async function submitComment() {
    if (!moment || !commentText.trim()) return;
    setSubmitting(true);
    await api.commentOnMoment(moment.id, commentText.trim());
    setCommentText('');
    setMoment(await api.getMoment(moment.id));
    setSubmitting(false);
  }

  if (!moment) {
    return (
      <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink900 }]}>
        <ActivityIndicator color={colors.auraPurple} />
      </View>
    );
  }

  const date = new Date(moment.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
      <View style={styles.fill}>
        <Image source={{ uri: moment.imageUri }} style={styles.heroImage} contentFit="cover" transition={300} />

        <LinearGradient colors={gradients.cardOverlay} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

        {/* Top controls */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.topBtn}
            accessibilityLabel="Go back"
          >
            <Text style={styles.topBtnIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn} onPress={openShare} accessibilityLabel="Share moment">
            <Text style={styles.topBtnIcon}>↗</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Spacer to push content below the image */}
          <View style={{ height: height * 0.45 }} />

          {/* Content overlay */}
          <View style={styles.contentOverlay}>
            {moment.isResurfaced && moment.resurfaceLabel && (
              <View style={styles.resurfaceBadge}>
                <Text style={styles.resurfaceText}>✦ {moment.resurfaceLabel}</Text>
              </View>
            )}
            <Text style={styles.dateLabel}>{date.toUpperCase()}</Text>
            {moment.caption ? (
              <Text style={styles.caption}>{moment.caption}</Text>
            ) : null}

            <View style={styles.moods}>
              {moment.moods.map((mood) => (
                <MoodPill key={mood} mood={mood} />
              ))}
            </View>

            {moment.people.length > 0 && (
              <View style={styles.people}>
                {moment.people.map((p) => (
                  <View key={p.id} style={styles.personChip}>
                    <CircleAvatar name={p.name} avatarUri={p.avatarUri} size={24} />
                    <Text style={styles.personName}>{p.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {moment.location && (
              <Text style={styles.location}>📍 {moment.location.label}</Text>
            )}

            {/* Reactions */}
            <View style={styles.reactionsRow}>
              {REACTIONS.map((emoji) => {
                const reaction = moment.reactions.find((r) => r.emoji === emoji);
                return (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => react(emoji)}
                    style={[styles.reactionBtn, reaction?.reactedByMe && styles.reactionBtnActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`React with ${emoji}`}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                    {reaction && reaction.count > 0 ? (
                      <Text style={styles.reactionCount}>{reaction.count}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Comments */}
            {moment.comments.length > 0 && (
              <View style={styles.comments}>
                {moment.comments.map((c) => (
                  <View key={c.id} style={styles.comment}>
                    <CircleAvatar name={c.authorName} avatarUri={c.authorAvatarUri} size={32} />
                    <View style={styles.commentBubble}>
                      <Text style={styles.commentAuthor}>{c.authorName}</Text>
                      <Text style={styles.commentText}>{c.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Comment engagement prompts */}
            {commentPrompts.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promptsRow}
              >
                {commentPrompts.map((prompt, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setCommentText(prompt)}
                    style={styles.promptChip}
                    accessibilityRole="button"
                    accessibilityLabel={`Use prompt: ${prompt}`}
                    accessibilityHint="Double tap to fill the comment input with this suggestion"
                  >
                    <Text style={styles.promptChipText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Comment input */}
            <View style={styles.commentInput}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                style={styles.commentField}
                placeholder="Add a quiet note…"
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <TouchableOpacity
                onPress={submitComment}
                disabled={!commentText.trim() || submitting}
                style={styles.commentSend}
                accessibilityRole="button"
                accessibilityLabel="Send comment"
              >
                <Text style={[styles.commentSendText, (!commentText.trim() || submitting) && { opacity: 0.4 }]}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Share modal */}
      <Modal visible={shareVisible} transparent animationType="slide" onRequestClose={() => setShareVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShareVisible(false)}>
          <Pressable style={styles.shareSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.shareHandle} />
            <Text style={styles.shareTitle}>Share with…</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
              {circleMembers.map((m) => {
                const done = sharedTo.has(m.id);
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.shareRow}
                    onPress={() => shareTo(m.id)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Share with ${m.displayName}`}
                  >
                    <CircleAvatar name={m.displayName} avatarUri={m.avatarUri} size={40} />
                    <Text style={styles.shareName}>{m.displayName}</Text>
                    {done && <Text style={styles.shareDone}>Shared ✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.ink900 },
  heroImage: { ...StyleSheet.absoluteFillObject },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10,13,27,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnIcon: { color: colors.textPrimary, fontSize: 20 },
  contentScroll: { flexGrow: 1 },
  contentOverlay: {
    backgroundColor: colors.glass900,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: height * 0.55,
  },
  resurfaceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(181, 124, 255, 0.2)',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.auraPurple,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  resurfaceText: { color: colors.auraPurple, fontFamily: fontFamily.sansMedium, fontSize: fontSize.micro },
  dateLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    letterSpacing: 1.2,
  },
  caption: {
    color: colors.textPrimary,
    fontFamily: fontFamily.serifRegular,
    fontSize: fontSize.title,
    lineHeight: 32,
  },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  people: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  personChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  personName: { color: colors.textSecondary, fontFamily: fontFamily.sans, fontSize: fontSize.caption },
  location: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption },
  reactionsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.glass700,
    minHeight: 44,
  },
  reactionBtnActive: { borderColor: colors.auraPurple, backgroundColor: 'rgba(181,124,255,0.30)' },
  promptsRow: { gap: spacing.sm, paddingBottom: spacing.xs },
  promptChip: {
    backgroundColor: 'rgba(181,124,255,0.12)',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  promptChipText: {
    color: colors.auraPurple,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
  },
  reactionEmoji: { fontSize: 18 },
  reactionCount: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption },
  comments: { gap: spacing.sm },
  comment: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.glass700,
    borderRadius: radii.lg,
    padding: spacing.sm,
    gap: 2,
  },
  commentAuthor: { color: colors.textSecondary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.caption },
  commentText: { color: colors.textPrimary, fontFamily: fontFamily.sans, fontSize: fontSize.caption, lineHeight: 18 },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.glass700,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  commentField: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
    minHeight: 36,
    maxHeight: 100,
  },
  commentSend: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  commentSendText: { color: colors.auraPurple, fontSize: 22 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  shareSheet: {
    backgroundColor: colors.ink900,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  shareHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSubtle,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  shareTitle: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.section,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  shareName: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
  },
  shareDone: {
    color: colors.auraPurple,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
});
