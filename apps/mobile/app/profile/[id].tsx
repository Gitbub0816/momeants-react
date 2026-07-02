import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenShell, GlassCard } from '../../src/components/core';
import { CircleAvatar } from '../../src/components/circle';
import { Skeleton } from '../../src/components/core/SkeletonLoader';
import { useApi } from '../../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

export default function OtherProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inCircle, setInCircle] = useState(false);
  const [addingCircle, setAddingCircle] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getUserProfile(id)
      .then((p) => setProfile(p))
      .catch(() => setProfile({ displayName: 'Unknown', username: 'unknown', tagline: '', avatarUri: undefined, momentCount: 0, daysRemembered: 0, peopleCount: 0 } as any))
      .finally(() => setLoading(false));
  }, [id, api]);

  async function handleCircleToggle() {
    if (addingCircle || !id) return;
    setAddingCircle(true);
    try {
      if (inCircle) {
        await api.removeFromCircle(id);
        setInCircle(false);
      } else {
        await api.addToCircle(id);
        setInCircle(true);
      }
    } catch {
      if (!inCircle) setInCircle(true);
    } finally {
      setAddingCircle(false);
    }
  }

  if (loading) {
    return (
      <ScreenShell>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go Back">
            <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.skeletonPad}>
          <Skeleton height={80} borderRadius={40} style={{ width: 80, alignSelf: 'center' }} />
          <Skeleton height={24} borderRadius={8} style={{ width: 160, alignSelf: 'center', marginTop: spacing.md }} />
          <Skeleton height={16} borderRadius={8} style={{ width: 100, alignSelf: 'center', marginTop: spacing.sm }} />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={130} borderRadius={16} style={{ marginTop: spacing.sm }} />
          ))}
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go Back">
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCircleToggle}
          disabled={addingCircle}
          style={[styles.circleBtn, inCircle && styles.circleBtnIn]}
          accessibilityRole="button"
          accessibilityLabel={inCircle ? 'In your circle' : 'Add to circle'}
        >
          {addingCircle ? (
            <ActivityIndicator size="small" color={colors.auraPurple} />
          ) : (
            <Text style={[styles.circleBtnText, inCircle && styles.circleBtnTextIn]}>
              {inCircle ? 'In Your Circle' : '+ Add to Circle'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <CircleAvatar
            name={profile?.displayName ?? '?'}
            avatarUri={profile?.avatarUri}
            size={80}
            hasGlow
          />
          <View style={styles.profileText}>
            <Text style={styles.displayName}>{profile?.displayName}</Text>
            <Text style={styles.username}>@{profile?.username}</Text>
            {profile?.tagline ? (
              <Text style={styles.tagline}>{profile.tagline}</Text>
            ) : null}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          {[
            { label: 'Moments', value: profile?.momentCount ?? 0 },
            { label: 'Days', value: profile?.daysRemembered ?? 0 },
            { label: 'People', value: profile?.peopleCount ?? 0 },
          ].map((stat) => (
            <GlassCard key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Moments grid — placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moments</Text>
          <View style={styles.momentGrid}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.momentPlaceholder}>
                <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
              </View>
            ))}
          </View>
          <View style={styles.privateNote}>
            <Ionicons name="sparkles" size={16} color={colors.auraLavender} style={styles.privateIcon} />
            <Text style={styles.privateText}>
              Moments shared with you will appear here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { color: colors.textSecondary, fontSize: 24 },
  circleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.auraPurple,
    minWidth: 130,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  circleBtnIn: {
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circleBtnText: {
    color: colors.auraPurple,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
  circleBtnTextIn: { color: colors.textMuted },
  skeletonPad: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xl, paddingBottom: spacing.xl },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileText: { flex: 1, gap: 4 },
  displayName: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.title,
  },
  username: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption },
  tagline: {
    color: colors.textSecondary,
    fontFamily: fontFamily.serifRegular,
    fontSize: fontSize.body,
    fontStyle: 'italic',
    marginTop: 4,
  },
  stats: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.md, gap: 4 },
  statValue: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.title },
  statLabel: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro },
  section: { gap: spacing.sm },
  sectionTitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.section,
  },
  momentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  momentPlaceholder: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: colors.glass800,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentLock: { fontSize: 28, opacity: 0.3 },
  privateNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  privateIcon: { color: colors.auraPurple, fontSize: 14 },
  privateText: {
    color: colors.textMuted,
    fontFamily: fontFamily.serifRegular,
    fontSize: fontSize.body,
    fontStyle: 'italic',
    flex: 1,
  },
});
