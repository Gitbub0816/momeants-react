import { Glyph } from '../../src/components/core/Glyph';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, MomeantsButton, GlassCard } from '../../src/components/core';
import { colors, fontFamily, fontSize, spacing } from '@momeants/design';

const PROMISES = [
  { icon: 'lock-closed-outline', title: 'Private By Default', body: 'Every moment you save is private until you choose otherwise.' },
  { icon: 'eye-off-outline', title: 'No Public Feed', body: 'Your memories aren\'t fodder for strangers. They\'re for the people you love.' },
  { icon: 'people-outline', title: 'No Follower Counts', body: 'We don\'t measure your relationships in numbers.' },
  { icon: 'sparkles-outline', title: 'You Own Your Memories', body: 'Export or delete everything, anytime. No questions asked.' },
];

export default function PrivacyPromiseScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>4 of 6</Text>
        <View style={styles.header}>
          <Text style={styles.title}>Our Privacy Promise</Text>
          <Text style={styles.subtitle}>Before you continue, here's what Momeants will never do.</Text>
        </View>

        <View style={styles.list}>
          {PROMISES.map((p) => (
            <GlassCard key={p.title} style={styles.card}>
              <Glyph value={p.icon} size={22} />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardBody}>{p.body}</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        <MomeantsButton
          label="I Understand, Continue"
          onPress={() => router.push('/(onboarding)/connect-people')}
          style={styles.cta}
        />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  step: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption },
  header: { gap: spacing.xs },
  title: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.display, lineHeight: 40 },
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, lineHeight: 23 },
  list: { gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.md,
  },
  icon: { fontSize: 24, marginTop: 2 },
  cardText: { flex: 1, gap: 4 },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.body,
  },
  cardBody: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption, lineHeight: 18 },
  cta: {},
});
