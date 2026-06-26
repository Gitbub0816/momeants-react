import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '@momeants/design';
import { spacing, radii } from '@momeants/design';
import { fontSize, fontFamily } from '@momeants/design';
import { GlassCard } from '../src/components/core/GlassCard';

const CONFIRM_PHRASE = 'delete my account';

export default function DeleteAccountScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmed = input.toLowerCase() === CONFIRM_PHRASE;

  const handleDelete = async () => {
    if (!confirmed) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Are you absolutely sure?',
      'This will permanently delete all your moments, circle, and account data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // In production: call api.deleteAccount() which triggers a Supabase Edge Function
              // that deletes all user data respecting RLS cascade rules, then deletes the auth user.
              // For now we sign out which clears local session.
              await signOut();
              router.replace('/(auth)/welcome');
            } catch {
              Alert.alert('Error', 'Could not delete account. Please try again or contact support.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Delete Account',
          headerStyle: { backgroundColor: colors.ink900 },
          headerTintColor: colors.textPrimary,
          headerBackTitle: 'Back',
        }}
      />
      <LinearGradient colors={[colors.ink900, '#1A0A0A']} style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Delete your account</Text>
            <Text style={styles.body}>
              This will permanently and irreversibly delete:
            </Text>

            <GlassCard style={styles.listCard}>
              {[
                'All your moments and photos',
                'Your circle connections',
                'Your profile and settings',
                'All Sparks history',
                'Your Momeants account',
              ].map((item) => (
                <Text key={item} style={styles.listItem}>
                  · {item}
                </Text>
              ))}
            </GlassCard>

            <Text style={styles.confirmLabel}>
              Type <Text style={styles.confirmPhrase}>delete my account</Text> to confirm
            </Text>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="delete my account"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Confirm account deletion"
            />

            <TouchableOpacity
              style={[styles.deleteButton, !confirmed && styles.deleteButtonDisabled]}
              onPress={handleDelete}
              disabled={!confirmed || loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Delete account permanently"
              accessibilityState={{ disabled: !confirmed }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete my account permanently</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  icon: { fontSize: 40, marginBottom: spacing.xs },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.title,
    fontFamily: fontFamily.serif,
    textAlign: 'center',
  },
  body: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    fontFamily: fontFamily.sans,
    textAlign: 'center',
  },
  listCard: {
    width: '100%',
    padding: spacing.md,
    gap: spacing.xs,
  },
  listItem: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sans,
    lineHeight: 22,
  },
  confirmLabel: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sans,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  confirmPhrase: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansMedium,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
    padding: spacing.md,
  },
  deleteButton: {
    width: '100%',
    backgroundColor: '#D93025',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteButtonDisabled: {
    opacity: 0.35,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: fontSize.body,
    fontFamily: fontFamily.sansMedium,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: fontSize.body,
    fontFamily: fontFamily.sans,
  },
});
