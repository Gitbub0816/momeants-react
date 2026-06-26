import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@momeants/design';
import { spacing } from '@momeants/design';
import { fontSize, fontFamily } from '@momeants/design';

interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = '✦', title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
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
  icon: { color: colors.auraPurple, fontSize: 36, marginBottom: spacing.xs },
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
  button: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(181,124,255,0.15)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.35)',
  },
  buttonText: {
    color: colors.auraPurple,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sansMedium,
  },
});
