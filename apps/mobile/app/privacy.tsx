import { Glyph } from '../src/components/core/Glyph';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenShell, GlassCard } from '../src/components/core';
import { useApi } from '../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

type Visibility = 'close_circle' | 'clique' | 'private';

const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string; icon: string }[] = [
  {
    value: 'close_circle',
    label: 'Close circle',
    description: 'Shared with the people you\'ve added to your circle',
    icon: '◎',
  },
  {
    value: 'clique',
    label: 'Specific clique',
    description: 'Only visible to members of a chosen clique',
    icon: 'people-outline',
  },
  {
    value: 'private',
    label: 'Just me',
    description: 'Only you can see this moment',
    icon: 'lock-closed-outline',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const api = useApi();
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>('close_circle');
  const [resurfaceConsent, setResurfaceConsent] = useState(true);
  const [activityVisible, setActivityVisible] = useState(true);

  useEffect(() => {
    api.getProfile().then((p) => {
      setDefaultVisibility((p.defaultPrivacy as Visibility) ?? 'close_circle');
    }).catch(() => {});
  }, []);

  async function persistPrivacy(updates: { resurfaceConsent?: boolean; activityVisible?: boolean; defaultPrivacy?: Visibility }) {
    try {
      await api.updateProfile(updates as any);
    } catch {
      // non-critical; local state already updated
    }
  }

  async function handleDownloadData() {
    try {
      const profile = await api.getProfile();
      const groups = await api.listTimeline({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 }).catch(() => []);
      const recentMoments = groups.flatMap((g) => g.moments ?? []);
      const exportData = {
        exportedAt: new Date().toISOString(),
        profile: {
          displayName: profile.displayName,
          username: profile.username,
          city: profile.city,
          memberSince: profile.createdAt,
          momentCount: profile.momentCount,
        },
        recentMoments: recentMoments.map((m) => ({
          caption: m.caption,
          moods: m.moods,
          location: m.location?.label,
          createdAt: m.createdAt,
        })),
      };
      await Share.share({
        title: 'My Momeants Data',
        message: JSON.stringify(exportData, null, 2),
      });
    } catch {
      Alert.alert('Export failed', 'Could not export your data. Please try again.');
    }
  }

  return (
    <ScreenShell edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Privacy</Text>
        </View>

        {/* Default visibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default moment visibility</Text>
          <Text style={styles.sectionSub}>Who sees your moments unless you change it per capture.</Text>
          <GlassCard style={styles.card}>
            {VISIBILITY_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDefaultVisibility(opt.value);
                  persistPrivacy({ defaultPrivacy: opt.value });
                }}
                style={[styles.optionRow, i > 0 && styles.optionBorder]}
                accessibilityRole="radio"
                accessibilityState={{ checked: defaultVisibility === opt.value }}
              >
                <Glyph value={opt.icon} size={18} color={colors.textSecondary} />
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.description}</Text>
                </View>
                <View style={[styles.radio, defaultVisibility === opt.value && styles.radioSelected]}>
                  {defaultVisibility === opt.value && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </GlassCard>
        </View>

        {/* Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <GlassCard style={styles.card}>
            {[
              {
                label: 'Allow resurfacing',
                description: 'Let Momeants surface old memories as reminders',
                value: resurfaceConsent,
                toggle: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const next = !resurfaceConsent;
                  setResurfaceConsent(next);
                  persistPrivacy({ resurfaceConsent: next });
                },
              },
              {
                label: 'Show activity to circle',
                description: 'Let circle members see when you last added a moment',
                value: activityVisible,
                toggle: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const next = !activityVisible;
                  setActivityVisible(next);
                  persistPrivacy({ activityVisible: next });
                },
              },
            ].map((item, i) => (
              <View key={item.label} style={[styles.toggleRow, i > 0 && styles.optionBorder]}>
                <View style={styles.toggleText}>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  <Text style={styles.optionDesc}>{item.description}</Text>
                </View>
                <TouchableOpacity
                  onPress={item.toggle}
                  style={[styles.toggle, item.value && styles.toggleActive]}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: item.value }}
                >
                  <View style={[styles.toggleThumb, item.value && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your data</Text>
          <GlassCard style={styles.card}>
            {[
              { label: 'Download my data', icon: '↓', action: handleDownloadData },
              { label: 'Delete account', icon: '⚠', danger: true, route: '/delete-account' },
            ].map((item, i) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (item.action) { item.action(); return; }
                  if (item.route) router.push(item.route as any);
                }}
                style={[styles.optionRow, i > 0 && styles.optionBorder]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Glyph value={item.icon} size={18} color={item.danger ? colors.danger : colors.textSecondary} />
                <Text style={[styles.optionLabel, item.danger && { color: colors.danger }]}>{item.label}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </GlassCard>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: colors.textMuted, fontSize: 22 },
  title: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.title,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.section,
  },
  sectionSub: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    marginTop: -spacing.xs,
  },
  card: { borderRadius: radii.xl, overflow: 'hidden' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 56,
  },
  optionBorder: { borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  optionIcon: { fontSize: 18, color: colors.textMuted, width: 28, textAlign: 'center' },
  optionText: { flex: 1, gap: 2 },
  optionLabel: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
  },
  optionDesc: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    lineHeight: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.auraPurple },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.auraPurple,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 64,
  },
  toggleText: { flex: 1, gap: 2 },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.borderSubtle,
    position: 'relative',
    justifyContent: 'center',
  },
  toggleActive: { backgroundColor: colors.auraPurple },
  toggleThumb: {
    position: 'absolute',
    left: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
  },
  toggleThumbActive: { left: 21 },
  chevron: { color: colors.textMuted, fontSize: 20 },
});
