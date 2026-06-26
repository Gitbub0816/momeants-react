import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import type { Clique } from '@momeants/types';
import { colors } from '@momeants/design';
import { spacing, radii } from '@momeants/design';
import { fontSize, fontFamily } from '@momeants/design';

interface CliqueCardProps {
  clique: Clique;
}

export function CliqueCard({ clique }: CliqueCardProps) {
  const router = useRouter();
  const previewMembers = clique.members.slice(0, 3);
  const extraCount = clique.memberCount - 3;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/clique/${clique.id}`);
      }}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={clique.name}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>{clique.emoji ?? '👥'}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{clique.name}</Text>
            <Text style={styles.type}>{clique.type.replace('_', ' ')}</Text>
          </View>
          {clique.activeSparks ? (
            <View style={styles.sparkBadge}>
              <Text style={styles.sparkBadgeText}>⚡ {clique.activeSparks}</Text>
            </View>
          ) : null}
        </View>

        {/* Members */}
        <View style={styles.membersRow}>
          {previewMembers.map((m) =>
            m.avatarUri ? (
              <Image
                key={m.id}
                source={{ uri: m.avatarUri }}
                style={[styles.memberAvatar, m.hasNewMoment && styles.memberAvatarGlow]}
                contentFit="cover"
              />
            ) : (
              <View key={m.id} style={[styles.memberAvatarFallback, m.hasNewMoment && styles.memberAvatarGlow]}>
                <Text style={styles.memberInitial}>{m.displayName[0]}</Text>
              </View>
            )
          )}
          {extraCount > 0 && (
            <View style={styles.extraCount}>
              <Text style={styles.extraCountText}>+{extraCount}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <Text style={styles.stat}>{clique.momentCount} moments</Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.stat}>{clique.memberCount} people</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  gradient: { padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(181,124,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  nameBlock: { flex: 1 },
  name: { color: colors.textPrimary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.body },
  type: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro, textTransform: 'capitalize' },
  sparkBadge: {
    backgroundColor: 'rgba(181,124,255,0.18)',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.30)',
  },
  sparkBadgeText: { color: colors.auraPurple, fontSize: fontSize.micro, fontFamily: fontFamily.sansMedium },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: -8 },
  memberAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.ink900 },
  memberAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(181,124,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink900,
  },
  memberAvatarGlow: { borderColor: colors.auraPurple },
  memberInitial: { color: colors.auraPurple, fontSize: 13, fontFamily: fontFamily.sansMedium },
  extraCount: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink900,
  },
  extraCountText: { color: colors.textMuted, fontSize: 11, fontFamily: fontFamily.sansMedium },
  stats: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stat: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro },
  statDot: { color: colors.textMuted, fontSize: fontSize.micro },
});
