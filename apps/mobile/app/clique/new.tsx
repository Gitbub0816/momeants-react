import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../src/components/core/GlassCard';
import { CircleAvatar } from '../../src/components/circle';
import { useApi } from '../../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';
import type { CircleMember } from '@momeants/types';

const EMOJI_OPTIONS = ['🌟', '🎉', '❤️', '🏕️', '🎵', '✈️', '🍕', '🌙'];

export default function NewCliqueScreen() {
  const router = useRouter();
  const api = useApi();
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🌟');
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);

  useEffect(() => {
    api.listCircleMembers().then(setCircleMembers).catch(() => {});
  }, [api]);

  function toggleMember(id: string) {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function createClique() {
    if (!name.trim() || creating) return;
    setCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await (api as any).createClique(name.trim(), Array.from(selectedMemberIds), selectedEmoji);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Clique</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name input */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.nameInput}
              placeholder="e.g. Family, Weekend Crew…"
              placeholderTextColor={colors.textMuted}
              maxLength={40}
              autoFocus
              accessibilityLabel="Clique name"
            />
          </GlassCard>

          {/* Emoji picker */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionLabel}>Choose an emoji</Text>
            <View style={styles.emojiRow}>
              {EMOJI_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedEmoji(emoji);
                  }}
                  style={[styles.emojiBtn, selectedEmoji === emoji && styles.emojiBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select emoji ${emoji}`}
                  accessibilityState={{ selected: selectedEmoji === emoji }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Member picker */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionLabel}>Add members</Text>
            <View style={styles.memberList}>
              {circleMembers.map((member) => {
                const selected = selectedMemberIds.has(member.id);
                return (
                  <TouchableOpacity
                    key={member.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleMember(member.id);
                    }}
                    style={styles.memberRow}
                    accessibilityRole="button"
                    accessibilityLabel={member.displayName}
                    accessibilityState={{ checked: selected }}
                  >
                    <CircleAvatar name={member.displayName} avatarUri={member.avatarUri} size={36} />
                    <Text style={styles.memberName}>{member.displayName}</Text>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Create button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={createClique}
            disabled={!name.trim() || creating}
            style={[styles.createBtn, (!name.trim() || creating) && styles.createBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Create clique"
          >
            <Text style={styles.createBtnText}>
              {creating ? 'Creating…' : `Create ${selectedEmoji} ${name.trim() || 'Clique'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.ink900 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: colors.textPrimary, fontSize: 22 },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.section,
  },
  scroll: { padding: spacing.lg, gap: spacing.md },
  section: { padding: spacing.md, gap: spacing.sm },
  sectionLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  nameInput: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
    paddingBottom: spacing.xs,
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emojiBtnActive: {
    borderColor: colors.auraPurple,
    backgroundColor: 'rgba(181,124,255,0.18)',
  },
  emojiText: { fontSize: 24 },
  memberList: { gap: spacing.xs },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    minHeight: 52,
  },
  memberName: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.auraPurple,
    backgroundColor: colors.auraPurple,
  },
  checkmark: { color: '#fff', fontSize: 14, fontFamily: fontFamily.sansMedium },
  bottomSpacer: { height: 40 },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  createBtn: {
    backgroundColor: colors.auraPurple,
    borderRadius: radii.lg,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: {
    color: '#fff',
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.body,
  },
});
