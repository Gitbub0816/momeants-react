import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, radii, fontFamily, fontSize } from '@momeants/design';

interface Props {
  name: string;
  avatarUri?: string;
  size?: number;
  hasGlow?: boolean;
  style?: ViewStyle;
}

export function CircleAvatar({ name, avatarUri, size = 66, hasGlow = false, style }: Props) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.ring,
        {
          width: size + 4,
          height: size + 4,
          borderRadius: (size + 4) / 2,
          borderColor: hasGlow ? colors.auraPurple : 'transparent',
          shadowColor: hasGlow ? colors.auraPurple : 'transparent',
        },
        style,
      ]}
    >
      <View style={[styles.avatarWrap, { width: size, height: size, borderRadius: size / 2 }]}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Text style={styles.initials}>{initials}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    padding: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarWrap: {
    overflow: 'hidden',
    backgroundColor: colors.ink700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.body,
  },
});
