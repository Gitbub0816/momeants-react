import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { MoodTag } from '@momeants/types';
import { colors, radii, fontFamily, fontSize, spacing } from '@momeants/design';

const ALL_MOODS: MoodTag[] = [
  'Peaceful', 'Grateful', 'Loved', 'Excited',
  'Nostalgic', 'Proud', 'Free', 'Cozy', 'Adventurous',
];

const MOOD_COLORS: Record<MoodTag, string> = {
  Peaceful: colors.auraBlue,
  Grateful: colors.candleGold,
  Loved: colors.love,
  Excited: colors.auraPink,
  Nostalgic: colors.auraLavender,
  Proud: colors.sunsetPeach,
  Free: colors.safe,
  Cozy: colors.candleGold,
  Adventurous: colors.auraPurple,
};

interface Props {
  selected: MoodTag[];
  onChange: (moods: MoodTag[]) => void;
  max?: number;
}

export function MoodSelector({ selected, onChange, max = 3 }: Props) {
  function toggle(mood: MoodTag) {
    Haptics.selectionAsync();
    if (selected.includes(mood)) {
      onChange(selected.filter((m) => m !== mood));
    } else if (selected.length < max) {
      onChange([...selected, mood]);
    }
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {ALL_MOODS.map((mood) => {
        const isSelected = selected.includes(mood);
        const accent = MOOD_COLORS[mood];
        return (
          <TouchableOpacity
            key={mood}
            onPress={() => toggle(mood)}
            accessibilityRole="checkbox"
            accessibilityLabel={mood}
            accessibilityState={{ checked: isSelected }}
            style={[
              styles.pill,
              { borderColor: isSelected ? accent : colors.borderSubtle },
              isSelected && { backgroundColor: `${accent}22` },
            ]}
          >
            <Text style={[styles.text, { color: isSelected ? accent : colors.textMuted }]}>
              {mood}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, gap: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  pill: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
});
