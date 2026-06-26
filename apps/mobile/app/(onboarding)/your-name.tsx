import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, MomeantsButton } from '../../src/components/core';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

export default function YourNameScreen() {
  const router = useRouter();
  const { data, setField } = useOnboarding();
  const [name, setName] = useState(data.name);

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.container}>
          <Text style={styles.step}>1 of 6</Text>
          <View style={styles.header}>
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.subtitle}>This is how your circle will know you.</Text>
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoFocus
          />
          <View style={styles.actions}>
            <MomeantsButton
              label="Continue"
              onPress={() => { setField('name', name.trim()); router.push('/(onboarding)/birthday'); }}
              disabled={!name.trim()}
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
  step: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
  },
  header: { gap: spacing.xs },
  title: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.display,
    lineHeight: 40,
  },
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body },
  input: {
    backgroundColor: colors.glass700,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.title,
    minHeight: 60,
  },
  actions: { marginTop: 'auto' },
});
