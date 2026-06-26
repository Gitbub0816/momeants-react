import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@momeants/design';
import { spacing, radii } from '@momeants/design';
import { fontSize, fontFamily } from '@momeants/design';

export default function ErrorScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={[colors.ink900, '#151B31']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.icon}>✦</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            We couldn't load this page. Your memories are safe.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(tabs)/home')}
            accessibilityRole="button"
            accessibilityLabel="Go home"
          >
            <Text style={styles.buttonText}>Go home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  icon: { color: colors.auraPurple, fontSize: 40, marginBottom: spacing.sm },
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
    lineHeight: 24,
  },
  button: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    backgroundColor: 'rgba(181,124,255,0.18)',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.40)',
  },
  buttonText: {
    color: colors.auraPurple,
    fontSize: fontSize.body,
    fontFamily: fontFamily.sansMedium,
  },
});
