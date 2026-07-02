import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, MomeantsButton, GlassCard } from '../../src/components/core';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { colors, fontFamily, fontSize, spacing } from '@momeants/design';

const EXAMPLES = [
  '"A memory from last summer is glowing again."',
  '"Ava shared a quiet moment with you."',
  '"One year ago, you felt free."',
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { complete } = useOnboarding();

  async function finish(notificationsEnabled: boolean) {
    await complete(notificationsEnabled);
    router.replace('/(tabs)/home');
  }

  return (
    <ScreenShell>
      <View style={styles.container}>
        <Text style={styles.step}>6 of 6</Text>
        <View style={styles.header}>
          <Text style={styles.title}>Gentle reminders</Text>
          <Text style={styles.subtitle}>
            Momeants will only notify you when something meaningful resurfaces. Never noise. Always warmth.
          </Text>
        </View>

        <View style={styles.examples}>
          {EXAMPLES.map((ex) => (
            <GlassCard key={ex} style={styles.example}>
              <Text style={styles.exampleText}>{ex}</Text>
            </GlassCard>
          ))}
        </View>

        <View style={styles.actions}>
          <MomeantsButton label="Allow Notifications" onPress={() => finish(true)} />
          <MomeantsButton label="Not Now" onPress={() => finish(false)} variant="quiet" />
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  step: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption },
  header: { gap: spacing.xs },
  title: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.display, lineHeight: 40 },
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, lineHeight: 23 },
  examples: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  example: { padding: spacing.md },
  exampleText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.serifRegular,
    fontSize: fontSize.body,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  actions: { gap: spacing.sm },
});
