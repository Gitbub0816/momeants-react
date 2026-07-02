import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@momeants/design';
import { spacing } from '@momeants/design';
import { fontSize, fontFamily } from '@momeants/design';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'sparkles-outline', title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconHalo}>
        <Ionicons name={icon} size={30} color={colors.auraLavender} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          activeOpacity={0.85}
          style={styles.buttonShadow}
        >
          <LinearGradient
            colors={['#78A7FF', '#B57CFF', '#FF7AC8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconHalo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(181,124,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.22)',
    marginBottom: spacing.sm,
    shadowColor: colors.auraPurple,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.section,
    fontFamily: fontFamily.serif,
    textAlign: 'center',
  },
  body: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sans,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonShadow: {
    marginTop: spacing.md,
    borderRadius: 999,
    shadowColor: colors.auraPurple,
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sansMedium,
    letterSpacing: 0.3,
  },
});
