import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@momeants/design/src/colors';
import { spacing, radii } from '@momeants/design/src/spacing';
import { fontSize, fontFamily } from '@momeants/design/src/typography';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <LinearGradient colors={[colors.ink900, '#151B31', colors.ink900]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <TouchableOpacity
            style={styles.back}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.icon}>🔑</Text>
            <Text style={styles.title}>Reset your password</Text>
            <Text style={styles.subtitle}>
              {sent
                ? `We sent a reset link to ${email}`
                : "Enter your email and we'll send you a reset link."}
            </Text>

            {!sent && (
              <>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  accessibilityLabel="Email address"
                />
                <TouchableOpacity
                  style={[styles.button, !email.trim() && styles.buttonDisabled]}
                  onPress={handleSend}
                  disabled={!email.trim() || loading}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Send reset link"
                >
                  <LinearGradient
                    colors={[colors.auraPurple, colors.auraBlue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Send reset link</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {sent && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.replace('/(auth)/sign-in')}
                accessibilityRole="button"
                accessibilityLabel="Back to sign in"
              >
                <Text style={styles.doneText}>Back to sign in</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  back: { padding: spacing.lg },
  backText: { color: colors.textMuted, fontSize: fontSize.md, fontFamily: fontFamily.sans },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  icon: { fontSize: 40, textAlign: 'center' },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.displaySM,
    fontFamily: fontFamily.serifBold,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontFamily: fontFamily.sans,
    textAlign: 'center',
    lineHeight: 24,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    padding: spacing.md,
    minHeight: 52,
  },
  button: { borderRadius: radii.lg, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.4 },
  buttonGradient: { paddingVertical: spacing.md + 2, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: fontSize.md, fontFamily: fontFamily.sansMedium },
  doneButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(181,124,255,0.15)',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.35)',
  },
  doneText: { color: colors.auraPurple, fontSize: fontSize.md, fontFamily: fontFamily.sansMedium },
});
