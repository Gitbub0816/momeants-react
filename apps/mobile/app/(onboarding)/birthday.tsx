import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, MomeantsButton } from '../../src/components/core';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

export default function BirthdayScreen() {
  const router = useRouter();
  const [birthday, setBirthday] = useState('');

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.container}>
          <Text style={styles.step}>2 of 6</Text>
          <View style={styles.header}>
            <Text style={styles.title}>When were you born?</Text>
            <Text style={styles.subtitle}>We use this to keep your account safe and personalize your experience.</Text>
          </View>
          <TextInput
            value={birthday}
            onChangeText={setBirthday}
            style={styles.input}
            placeholder="MM / DD / YYYY"
            placeholderTextColor={colors.textMuted}
            keyboardType="numbers-and-punctuation"
          />
          <View style={styles.actions}>
            <MomeantsButton
              label="Continue"
              onPress={() => router.push('/(onboarding)/username')}
              disabled={!birthday.trim()}
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
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, lineHeight: 23 },
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
