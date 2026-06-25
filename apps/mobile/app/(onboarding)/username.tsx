import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, MomeantsButton } from '../../src/components/core';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

export default function UsernameScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.container}>
          <Text style={styles.step}>3 of 6</Text>
          <View style={styles.header}>
            <Text style={styles.title}>Choose a username</Text>
            <Text style={styles.subtitle}>Your circle will find you by this. Keep it simple.</Text>
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.at}>@</Text>
            <TextInput
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
              style={styles.input}
              placeholder="yourname"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.actions}>
            <MomeantsButton
              label="Continue"
              onPress={() => router.push('/(onboarding)/avatar')}
              disabled={username.length < 3}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass700,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    minHeight: 60,
  },
  at: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.title, marginRight: 4 },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.title,
  },
  actions: { marginTop: 'auto' },
});
