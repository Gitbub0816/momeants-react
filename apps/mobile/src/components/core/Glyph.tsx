import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@momeants/design';

interface GlyphProps {
  value: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

// Renders an Ionicons icon when `value` is a known icon name; falls back to
// plain text for legacy values stored in existing data.
export function Glyph({ value, size = 18, color = colors.auraLavender, style }: GlyphProps) {
  if (value in Ionicons.glyphMap) {
    return <Ionicons name={value as keyof typeof Ionicons.glyphMap} size={size} color={color} style={style} />;
  }
  return <Text style={[{ fontSize: size, color }, style]}>{value}</Text>;
}
