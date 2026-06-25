import React from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';
import type { MoodTag } from '@momeants/types';
import { colors, radii, fontFamily, fontSize } from '@momeants/design';

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
  mood: MoodTag;
  style?: ViewStyle;
}

export function MoodPill({ mood, style }: Props) {
  const accent = MOOD_COLORS[mood] ?? colors.auraPurple;
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: `${accent}22`, borderColor: `${accent}55` },
        style,
      ]}
    >
      <Text style={[styles.text, { color: accent }]}>{mood}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
});
