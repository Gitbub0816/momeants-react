import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '@momeants/design';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  withGlowBlobs?: boolean;
}

export function ScreenShell({ children, style, edges = ['top', 'bottom'], withGlowBlobs = true }: Props) {
  return (
    <LinearGradient colors={gradients.background} style={styles.fill}>
      {withGlowBlobs && (
        <>
          <View style={styles.blobPurple} />
          <View style={styles.blobBlue} />
        </>
      )}
      <SafeAreaView edges={edges} style={[styles.fill, style]}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blobPurple: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(181, 124, 255, 0.12)',
  },
  blobBlue: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(120, 167, 255, 0.08)',
  },
});
