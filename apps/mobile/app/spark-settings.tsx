import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { SparkSettings, SparkCategory } from '@momeants/types';
import { useApi } from '../src/context/ApiContext';
import { colors, spacing, radii, fontSize, fontFamily } from '@momeants/design';
import { GlassCard } from '../src/components/core/GlassCard';

const ALL_CATEGORIES: { key: SparkCategory; label: string; icon: string }[] = [
  { key: 'conversation', label: 'Conversations', icon: '💬' },
  { key: 'memory', label: 'Memories', icon: '✨' },
  { key: 'relationship', label: 'Relationships', icon: '🤝' },
  { key: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { key: 'couple', label: 'Couples', icon: '💑' },
  { key: 'friendship', label: 'Friendships', icon: '🫂' },
  { key: 'photo', label: 'Photo Challenges', icon: '📸' },
  { key: 'creative', label: 'Creative', icon: '🎨' },
  { key: 'discovery', label: 'Discovery', icon: '🔍' },
  { key: 'seasonal', label: 'Seasonal', icon: '🌿' },
  { key: 'holiday', label: 'Holidays', icon: '🎉' },
  { key: 'storytelling', label: 'Storytelling', icon: '📖' },
  { key: 'clique', label: 'Group Fun', icon: '🙌' },
];

const FREQUENCY_OPTIONS = [1, 2, 3, 5, 7];

export default function SparkSettingsScreen() {
  const api = useApi();
  const router = useRouter();
  const [settings, setSettings] = useState<SparkSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSparkSettings().then(setSettings);
  }, []);

  const save = async (updates: Partial<SparkSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...updates };
    setSettings(next);
    setSaving(true);
    try {
      await api.updateSparkSettings(updates);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = async (cat: SparkCategory) => {
    if (!settings) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const enabled = settings.enabledCategories.includes(cat)
      ? settings.enabledCategories.filter((c) => c !== cat)
      : [...settings.enabledCategories, cat];
    await save({ enabledCategories: enabled });
  };

  if (!settings) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.auraPurple} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Spark Settings',
          headerStyle: { backgroundColor: colors.ink900 },
          headerTintColor: colors.textPrimary,
          headerBackTitle: 'Back',
        }}
      />
      <LinearGradient
        colors={[colors.ink900, '#151B31', colors.ink900]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Master toggle */}
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>Sparks Enabled</Text>
                  <Text style={styles.rowSub}>Receive daily social micro-experiences</Text>
                </View>
                <Switch
                  value={settings.enabled}
                  onValueChange={(v) => save({ enabled: v })}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.auraPurple }}
                  thumbColor="#fff"
                />
              </View>
            </GlassCard>

            {settings.enabled && (
              <>
                {/* Frequency */}
                <Text style={styles.sectionLabel}>HOW OFTEN</Text>
                <GlassCard style={styles.card}>
                  <Text style={styles.rowTitle}>Per Week</Text>
                  <View style={styles.freqRow}>
                    {FREQUENCY_OPTIONS.map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[
                          styles.freqChip,
                          settings.frequencyPerWeek === n && styles.freqChipActive,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          save({ frequencyPerWeek: n });
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${n} times per week`}
                      >
                        <Text
                          style={[
                            styles.freqText,
                            settings.frequencyPerWeek === n && styles.freqTextActive,
                          ]}
                        >
                          {n}×
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </GlassCard>

                {/* Personalisation toggles */}
                <Text style={styles.sectionLabel}>PERSONALISATION</Text>
                <GlassCard style={styles.card}>
                  {[
                    {
                      key: 'allowLocation' as const,
                      label: 'Location-aware Sparks',
                      sub: 'Suggestions based on where you are',
                    },
                    {
                      key: 'allowHolidays' as const,
                      label: 'Holiday Sparks',
                      sub: 'Special prompts around holidays',
                    },
                    {
                      key: 'allowRelationship' as const,
                      label: 'Relationship-aware',
                      sub: 'Tailored for your circle dynamics',
                    },
                    {
                      key: 'allowAiPersonalization' as const,
                      label: 'AI Personalisation',
                      sub: 'Smarter recommendations over time',
                    },
                  ].map(({ key, label, sub }, idx, arr) => (
                    <View key={key}>
                      <View style={styles.row}>
                        <View style={styles.rowText}>
                          <Text style={styles.rowTitle}>{label}</Text>
                          <Text style={styles.rowSub}>{sub}</Text>
                        </View>
                        <Switch
                          value={settings[key] as boolean}
                          onValueChange={(v) => save({ [key]: v })}
                          trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.auraPurple }}
                          thumbColor="#fff"
                        />
                      </View>
                      {idx < arr.length - 1 && <View style={styles.divider} />}
                    </View>
                  ))}
                </GlassCard>

                {/* Categories */}
                <Text style={styles.sectionLabel}>SPARK TYPES</Text>
                <GlassCard style={styles.card}>
                  {ALL_CATEGORIES.map(({ key, label, icon }, idx) => {
                    const active = settings.enabledCategories.includes(key);
                    return (
                      <View key={key}>
                        <TouchableOpacity
                          style={styles.row}
                          onPress={() => toggleCategory(key)}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={`${active ? 'Disable' : 'Enable'} ${label}`}
                        >
                          <Text style={styles.catIcon}>{icon}</Text>
                          <View style={styles.rowText}>
                            <Text style={[styles.rowTitle, !active && styles.rowTitleMuted]}>
                              {label}
                            </Text>
                          </View>
                          <View style={[styles.check, active && styles.checkActive]}>
                            {active && <Text style={styles.checkMark}>✓</Text>}
                          </View>
                        </TouchableOpacity>
                        {idx < ALL_CATEGORIES.length - 1 && <View style={styles.divider} />}
                      </View>
                    );
                  })}
                </GlassCard>
              </>
            )}

            {saving && (
              <View style={styles.savingBanner}>
                <ActivityIndicator size="small" color={colors.auraPurple} />
                <Text style={styles.savingText}>Saving…</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl },
  center: {
    flex: 1,
    backgroundColor: colors.ink900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: fontSize.micro,
    fontFamily: fontFamily.sansMedium,
    letterSpacing: 1.2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 56,
  },
  rowText: { flex: 1 },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontFamily: fontFamily.sansMedium,
  },
  rowTitleMuted: { color: colors.textMuted },
  rowSub: {
    color: colors.textMuted,
    fontSize: fontSize.micro,
    fontFamily: fontFamily.sans,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: spacing.md,
  },
  freqRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  freqChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  freqChipActive: {
    backgroundColor: 'rgba(181,124,255,0.20)',
    borderColor: colors.auraPurple,
  },
  freqText: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sansMedium,
  },
  freqTextActive: { color: colors.auraPurple },
  catIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    backgroundColor: colors.auraPurple,
    borderColor: colors.auraPurple,
  },
  checkMark: { color: '#fff', fontSize: 13, fontFamily: fontFamily.sansMedium },
  savingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  savingText: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sans,
  },
});
