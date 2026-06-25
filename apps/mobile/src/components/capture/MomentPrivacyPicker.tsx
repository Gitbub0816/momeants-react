import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { MomentVisibility } from '@momeants/types';
import { colors, radii, fontFamily, fontSize, spacing } from '@momeants/design';

const OPTIONS: { value: MomentVisibility; label: string; description: string; icon: string }[] = [
  { value: 'private', label: 'Only Me', description: 'Your memory, kept close.', icon: '🔒' },
  { value: 'close_circle', label: 'Close Circle', description: 'People who matter most.', icon: '◎' },
  { value: 'selected_people', label: 'Selected People', description: 'Choose who sees this.', icon: '○' },
];

interface Props {
  value: MomentVisibility;
  onChange: (v: MomentVisibility) => void;
}

export function MomentPrivacyPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Who can see this?</Text>
      <View style={styles.options}>
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(opt.value);
              }}
              accessibilityRole="radio"
              accessibilityLabel={opt.label}
              accessibilityState={{ selected: isSelected }}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <Text style={styles.icon}>{opt.icon}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.description}</Text>
              </View>
              {isSelected && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: {
    color: colors.textMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  options: { gap: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.glass700,
    minHeight: 44,
  },
  optionSelected: {
    borderColor: colors.auraPurple,
    backgroundColor: 'rgba(181, 124, 255, 0.1)',
  },
  icon: { fontSize: 20 },
  optionText: { flex: 1 },
  optionLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.body,
  },
  optionLabelSelected: { color: colors.textPrimary },
  optionDesc: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.auraPurple,
  },
});
