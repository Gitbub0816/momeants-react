import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenShell, GlassCard, MomeantsButton } from '../src/components/core';
import { useApi } from '../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

export default function ResurfacingControlsScreen() {
  const router = useRouter();
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [hiddenPersonIds, setHiddenPersonIds] = useState<string[]>([]);
  const [hiddenPlaceNames, setHiddenPlaceNames] = useState<string[]>([]);
  const [people, setPeople] = useState<Array<{ id: string; displayName: string }>>([]);

  const load = useCallback(async () => {
    const [rules, members] = await Promise.all([
      api.getResurfacingRules().catch(() => ({ enabled: true, hiddenPersonIds: [], hiddenPlaceNames: [] })),
      api.listCircleMembers().catch(() => []),
    ]);
    setEnabled(rules.enabled);
    setHiddenPersonIds(rules.hiddenPersonIds);
    setHiddenPlaceNames(rules.hiddenPlaceNames);
    setPeople(members.map((m) => ({ id: m.id, displayName: m.displayName })));
  }, [api]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  function togglePerson(id: string) {
    setHiddenPersonIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function save() {
    setSaving(true);
    try {
      await api.updateResurfacingRules({ enabled, hiddenPersonIds, hiddenPlaceNames });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenShell>
        <View style={styles.center}>
          <ActivityIndicator color={colors.auraPurple} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go Back">
            <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Resurfacing</Text>
          <Text style={styles.subtitle}>
            Control which memories come back to you — and which ones stay quiet.
          </Text>
        </View>

        <GlassCard style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleLabel}>Enable resurfacing</Text>
              <Text style={styles.toggleDesc}>Memories from this day in past years.</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: colors.borderSubtle, true: colors.auraPurple }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </GlassCard>

        {enabled && people.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hide memories with these people</Text>
            <Text style={styles.sectionDesc}>
              Memories tagged with these people won't resurface.
            </Text>
            <View style={styles.chipRow}>
              {people.map((person) => {
                const hidden = hiddenPersonIds.includes(person.id);
                return (
                  <TouchableOpacity
                    key={person.id}
                    onPress={() => togglePerson(person.id)}
                    style={[styles.chip, hidden && styles.chipHidden, hidden && { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                    accessibilityRole="checkbox"
                    accessibilityLabel={person.displayName}
                    accessibilityState={{ checked: hidden }}
                  >
                    {hidden && <Ionicons name="close" size={13} color={colors.textMuted} />}
                    <Text style={[styles.chipText, hidden && styles.chipTextHidden]}>
                      {person.displayName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {enabled && people.length === 0 && (
          <View style={styles.emptyPeople}>
            <Text style={styles.emptyText}>Add people to your circle to filter by person.</Text>
          </View>
        )}

        <MomeantsButton label={saving ? 'Saving…' : 'Save preferences'} onPress={save} disabled={saving} />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row' },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { color: colors.textSecondary, fontSize: 24 },
  header: { gap: spacing.xs },
  title: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.display },
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, lineHeight: 23 },
  toggleCard: { padding: spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggleText: { flex: 1 },
  toggleLabel: { color: colors.textPrimary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.body },
  toggleDesc: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption, marginTop: 2 },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textSecondary, fontFamily: fontFamily.sansSemiBold, fontSize: fontSize.section },
  sectionDesc: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption, lineHeight: 18 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass700,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipHidden: { borderColor: colors.danger, backgroundColor: 'rgba(255,107,122,0.1)' },
  chipText: { color: colors.textSecondary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.caption },
  chipTextHidden: { color: colors.danger },
  emptyPeople: { paddingVertical: spacing.sm },
  emptyText: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption, textAlign: 'center' },
});
