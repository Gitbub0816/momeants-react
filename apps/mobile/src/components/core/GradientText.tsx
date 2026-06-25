import React from 'react';
import { Text, TextStyle } from 'react-native';
import { colors, fontFamily, fontSize } from '@momeants/design';

interface Props {
  children: React.ReactNode;
  style?: TextStyle;
}

// React Native doesn't natively support gradient text — this uses auraPurple as a fallback.
// For true gradient text, use react-native-linear-gradient with MaskedView.
export function GradientText({ children, style }: Props) {
  return (
    <Text
      style={[
        {
          color: colors.auraPurple,
          fontFamily: fontFamily.serif,
          fontSize: fontSize.display,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
