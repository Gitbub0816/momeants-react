import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenShell, MomeantsButton, GradientText } from '../../src/components/core';
import { colors, gradients, fontFamily, fontSize, spacing, radii } from '@momeants/design';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <LinearGradient colors={gradients.aura} style={styles.logoGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.logoIcon}>✦</Text>
            </LinearGradient>
          </View>
          <GradientText style={styles.wordmark}>momeants</GradientText>
          <Text style={styles.tagline}>Capture life. Relive feelings.</Text>
        </View>

        <View style={styles.description}>
          <Text style={styles.descText}>
            A quiet, beautiful place for{'\n'}your most meaningful memories.
          </Text>
        </View>

        <View style={styles.actions}>
          <MomeantsButton
            label="Create an account"
            onPress={() => router.push('/(auth)/create-account')}
          />
          <MomeantsButton
            label="Sign in"
            onPress={() => router.push('/(auth)/sign-in')}
            variant="glass"
          />
        </View>

        <Text style={styles.privacy}>
          Private by default. No public feed. No follower counts.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  hero: { alignItems: 'center', gap: spacing.md },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  logoGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 36, color: colors.textPrimary },
  wordmark: {
    fontSize: fontSize.displayXL,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: colors.auraPurple,
  },
  tagline: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
  },
  description: { alignItems: 'center' },
  descText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.serifRegular,
    fontSize: fontSize.title,
    textAlign: 'center',
    lineHeight: 32,
  },
  actions: { gap: spacing.sm },
  privacy: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    textAlign: 'center',
  },
});
