import { Glyph } from '../../src/components/core/Glyph';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, MomeantsButton } from '../../src/components/core';
import { colors, fontFamily, fontSize, spacing } from '@momeants/design';

export default function ConnectPeopleScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <View style={styles.container}>
        <Text style={styles.step}>5 of 6</Text>
        <View style={styles.hero}>
          <Glyph value="people-circle-outline" size={40} />
          <Text style={styles.title}>Build your circle</Text>
          <Text style={styles.subtitle}>
            Momeants is better with the people who matter to you.{'\n\n'}
            You can invite friends and family now, or start capturing memories first — it's up to you.
          </Text>
        </View>

        <View style={styles.actions}>
          <MomeantsButton
            label="Find people I know"
            onPress={() => router.push('/(onboarding)/notifications')}
          />
          <MomeantsButton
            label="Skip for now"
            onPress={() => router.push('/(onboarding)/notifications')}
            variant="quiet"
          />
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
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  emoji: { fontSize: 64, color: colors.auraPurple },
  title: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.display,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: { gap: spacing.sm },
});
