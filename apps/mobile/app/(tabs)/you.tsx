import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import type { UserProfile, MoodTag } from '@momeants/types';
import { ScreenShell, GlassCard } from '../../src/components/core';
import { CircleAvatar } from '../../src/components/circle';
import { MoodPill } from '../../src/components/memory';
import { useApi } from '../../src/context/ApiContext';
import { useAuth } from '../../src/context/AuthContext';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

export default function YouScreen() {
  const api = useApi();
  const { signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    api.getProfile().then(setProfile);
  }, []);

  if (!profile) {
    return (
      <ScreenShell>
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={colors.auraPurple} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.profileHeader}>
          <CircleAvatar name={profile.displayName} avatarUri={profile.avatarUri} size={80} hasGlow />
          <View style={styles.profileText}>
            <Text style={styles.displayName}>{profile.displayName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>
            {profile.tagline ? <Text style={styles.tagline}>{profile.tagline}</Text> : null}
          </View>
        </View>

        <View style={styles.stats}>
          {[
            { label: 'Moments', value: profile.momentCount },
            { label: 'Days', value: profile.daysRemembered },
            { label: 'People', value: profile.peopleCount },
          ].map((stat) => (
            <GlassCard key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {profile.topMoods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top feelings</Text>
            <View style={styles.moodsRow}>
              {profile.topMoods.map((mood) => (
                <MoodPill key={mood} mood={mood as MoodTag} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <GlassCard style={styles.settingsCard}>
            {[
              { label: 'Edit profile', icon: '○', route: '/edit-profile' },
              { label: 'Privacy & visibility', icon: '🔒', route: '/privacy' },
              { label: 'Resurfacing controls', icon: '✦', route: '/resurfacing-controls' },
              { label: 'Spark settings', icon: '⚡', route: '/spark-settings' },
              { label: 'Browse sparks', icon: '⚡', route: '/sparks' },
              { label: 'Notifications', icon: '◎', route: '/notifications' },
              { label: 'Delete account', icon: '⚠', route: '/delete-account' },
            ].map((item, i) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => item.route && router.push(item.route as any)}
                style={[styles.settingsRow, i > 0 && styles.settingsBorder]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Text style={styles.settingsIcon}>{item.icon}</Text>
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Text style={styles.settingsChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </GlassCard>
        </View>

        <TouchableOpacity onPress={signOut} style={styles.signOut} accessibilityRole="button" accessibilityLabel="Sign out">
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: spacing.md, paddingHorizontal: spacing.lg, gap: spacing.xl },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileText: { flex: 1, gap: 4 },
  displayName: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.title },
  username: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption },
  tagline: { color: colors.textSecondary, fontFamily: fontFamily.serifRegular, fontSize: fontSize.body, fontStyle: 'italic', marginTop: 4 },
  stats: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.md, gap: 4 },
  statValue: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.title },
  statLabel: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textSecondary, fontFamily: fontFamily.sansSemiBold, fontSize: fontSize.section },
  moodsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  settingsCard: { borderRadius: radii.xl, overflow: 'hidden' },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 52,
  },
  settingsBorder: { borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  settingsIcon: { fontSize: 16, color: colors.textMuted, width: 24, textAlign: 'center' },
  settingsLabel: { flex: 1, color: colors.textPrimary, fontFamily: fontFamily.sans, fontSize: fontSize.body },
  settingsChevron: { color: colors.textMuted, fontSize: 20 },
  signOut: { alignItems: 'center', paddingVertical: spacing.md, minHeight: 44, justifyContent: 'center' },
  signOutText: { color: colors.danger, fontFamily: fontFamily.sansMedium, fontSize: fontSize.body },
  tabBarSpacer: { height: 120 },
});
