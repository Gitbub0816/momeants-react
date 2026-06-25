import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { colors } from '@momeants/design/src/colors';
import { fontSize, fontFamily } from '@momeants/design/src/typography';
import { spacing } from '@momeants/design/src/spacing';

export function OfflineBanner() {
  const online = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (online) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 4 }]}>
      <Text style={styles.text}>No connection — your moments are saved locally</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,122,200,0.90)',
    paddingBottom: spacing.xs,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontFamily: fontFamily.sansMedium,
  },
});
