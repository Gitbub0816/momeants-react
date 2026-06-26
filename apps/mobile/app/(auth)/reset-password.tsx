import React, { useState, useEffect } from 'react';
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
import { colors, spacing, radii, fontSize, fontFamily } from '@momeants/design';
import { getSupabaseClient } from '@momeants/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const sb = getSupabaseClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    // Supabase automatically picks up the session from the deep link token
    const { data: { subscription } } = sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!password.trim() || password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    try {
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.ink900, '#151B31', colors.ink900]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <View style={styles.content}>
            <Text style={styles.icon}>🔐</Text>
            <Text style={styles.title}>Set new password</Text>

            {done ? (
              <>
                <Text style={styles.subtitle}>Your password has been updated.</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.replace('/(auth)/sign-in')}
                  accessibilityRole="button"
                  accessibilityLabel="Back to sign in"
                >
                  <Text style={styles.buttonText}>Back to sign in</Text>
                </TouchableOpacity>
              </>
            ) : !sessionReady ? (
              <Text style={styles.subtitle}>Verifying reset link…</Text>
            ) : (
              <>
                <Text style={styles.subtitle}>Choose a new password for your account.</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="New password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoComplete="new-password"
                  accessibilityLabel="New password"
                />
                <TextInput
                  style={styles.input}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Confirm password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoComplete="new-password"
                  accessibilityLabel="Confirm password"
                />
                <TouchableOpacity
                  style={[styles.button, (!password.trim() || password !== confirm) && styles.buttonDisabled]}
                  onPress={handleReset}
                  disabled={!password.trim() || password !== confirm || loading}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Update password"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Update password</Text>
                  )}
                </TouchableOpacity>
              </>
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
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  icon: { fontSize: 40, textAlign: 'center' },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.display,
    fontFamily: fontFamily.serif,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
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
    fontSize: fontSize.body,
    padding: spacing.md,
    minHeight: 52,
  },
  button: {
    backgroundColor: colors.auraPurple,
    borderRadius: radii.lg,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: fontSize.body, fontFamily: fontFamily.sansMedium },
});
