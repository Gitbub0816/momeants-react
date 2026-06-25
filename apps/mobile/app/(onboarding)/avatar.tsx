import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenShell, MomeantsButton } from '../../src/components/core';
import { colors, gradients, fontFamily, fontSize, spacing, radii } from '@momeants/design';

export default function AvatarScreen() {
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setAvatarUri(result.assets[0].uri);
    }
  }

  return (
    <ScreenShell>
      <View style={styles.container}>
        <Text style={styles.step}>Optional</Text>
        <View style={styles.header}>
          <Text style={styles.title}>Add a photo</Text>
          <Text style={styles.subtitle}>
            Help your circle recognise you. You can always change this later.
          </Text>
        </View>

        <View style={styles.avatarCenter}>
          <TouchableOpacity
            onPress={pickAvatar}
            style={styles.avatarRing}
            accessibilityRole="button"
            accessibilityLabel="Choose profile photo"
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={gradients.aura}
                style={styles.avatarPlaceholder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarIcon}>+</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
          <Text style={styles.tapHint}>{avatarUri ? 'Tap to change' : 'Tap to choose'}</Text>
        </View>

        <View style={styles.actions}>
          <MomeantsButton
            label={avatarUri ? 'Continue' : 'Skip for now'}
            onPress={() => router.push('/(onboarding)/privacy-promise')}
          />
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  step: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption },
  header: { gap: spacing.xs },
  title: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.display, lineHeight: 40 },
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, lineHeight: 23 },
  avatarCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  avatarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.auraPurple,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { color: colors.textPrimary, fontSize: 48, lineHeight: 56 },
  tapHint: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption },
  actions: {},
});
