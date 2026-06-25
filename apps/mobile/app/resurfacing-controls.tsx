import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, GlassCard, MomeantsButton } from '../src/components/core';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

const EXAMPLE_PEOPLE = ['Ava', 'Marcus', 'Sofia'];
const EXAMPLE_PLACES = ['Twin Peaks', 'Lake Tahoe', 'Central Park'];

export default function ResurfacingControlsScreen() {
  const router = useRouter();
  const [hiddenPeople, setHiddenPeople] = useState<string[]>([]);
  const [hiddenPlaces, setHiddenPlaces] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);

  function togglePerson(name: string) {
    setHiddenPeople((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  }

  function togglePlace(name: string) {
    setHiddenPlaces((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  }

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back">
            <Text style={styles.backIcon}>←</Text>
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

        {enabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hide memories with these people</Text>
              <Text style={styles.sectionDesc}>
                Memories tagged with these people won't resurface.
              </Text>
              <View style={styles.chipRow}>
                {EXAMPLE_PEOPLE.map((name) => {
                  const hidden = hiddenPeople.includes(name);
                  return (
                    <TouchableOpacity
                      key={name}
                      onPress={() => togglePerson(name)}
                      style={[styles.chip, hidden && styles.chipHidden]}
                      accessibilityRole="checkbox"
                      accessibilityLabel={name}
                      accessibilityState={{ checked: hidden }}
                    >
                      <Text style={[styles.chipText, hidden && styles.chipTextHidden]}>
                        {hidden ? '✕ ' : ''}{name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hide memories from these places</Text>
              <Text style={styles.sectionDesc}>
                Memories tagged at these locations won't resurface.
              </Text>
              <View style={styles.chipRow}>
                {EXAMPLE_PLACES.map((place) => {
                  const hidden = hiddenPlaces.includes(place);
                  return (
                    <TouchableOpacity
                      key={place}
                      onPress={() => togglePlace(place)}
                      style={[styles.chip, hidden && styles.chipHidden]}
                      accessibilityRole="checkbox"
                      accessibilityLabel={place}
                      accessibilityState={{ checked: hidden }}
                    >
                      <Text style={[styles.chipText, hidden && styles.chipTextHidden]}>
                        {hidden ? '✕ ' : ''}{place}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}

        <MomeantsButton label="Save preferences" onPress={() => router.back()} />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xl },
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
});
