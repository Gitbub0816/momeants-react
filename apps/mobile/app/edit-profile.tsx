import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenShell, MomeantsButton } from '../src/components/core';
import { MomentPrivacyPicker } from '../src/components/capture';
import { useApi } from '../src/context/ApiContext';
import type { UserProfile, MomentVisibility } from '@momeants/types';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

export default function EditProfileScreen() {
  const router = useRouter();
  const api = useApi();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [defaultPrivacy, setDefaultPrivacy] = useState<MomentVisibility>('close_circle');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile().then((p) => {
      setProfile(p);
      setDisplayName(p.displayName);
      setTagline(p.tagline ?? '');
      setUsername(p.username);
      setCity(p.city ?? '');
      setAvatarUri(p.avatarUri ?? null);
      setDefaultPrivacy(p.defaultPrivacy);
    });
  }, []);

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function save() {
    setSaving(true);
    await api.updateProfile({
      fullName: displayName,
      username,
      tagline,
      city,
      avatarUri: avatarUri ?? undefined,
      defaultPrivacy,
    } as any);
    setSaving(false);
    router.back();
  }

  if (!profile) {
    return (
      <ScreenShell>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.auraPurple} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Cancel">
              <Text style={styles.backIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>Edit Profile</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap} accessibilityLabel="Change photo">
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarEmpty]}>
                  <Text style={styles.avatarInitial}>
                    {displayName[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditIcon}>✎</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Display name</Text>
              <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} placeholderTextColor={colors.textMuted} autoCapitalize="words" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Username</Text>
              <View style={styles.usernameRow}>
                <Text style={styles.at}>@</Text>
                <TextInput value={username} onChangeText={setUsername} style={[styles.input, styles.flex]} placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tagline</Text>
              <TextInput value={tagline} onChangeText={setTagline} style={styles.input} placeholder="A line that feels like you" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="Where are you?" placeholderTextColor={colors.textMuted} autoCapitalize="words" />
            </View>
          </View>

          {/* Default privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Default moment privacy</Text>
            <MomentPrivacyPicker value={defaultPrivacy} onChange={setDefaultPrivacy} />
          </View>

          <MomeantsButton label="Save changes" onPress={save} loading={saving} />
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { color: colors.textSecondary, fontSize: 20 },
  navTitle: { color: colors.textPrimary, fontFamily: fontFamily.sansSemiBold, fontSize: fontSize.section },
  avatarSection: { alignItems: 'center' },
  avatarWrap: { position: 'relative', width: 100, height: 100 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.auraPurple },
  avatarEmpty: { backgroundColor: colors.ink700, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36 },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.auraPurple,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEditIcon: { color: colors.textPrimary, fontSize: 14 },
  fields: { gap: spacing.md },
  field: { gap: spacing.xs },
  fieldLabel: { color: colors.textMuted, fontFamily: fontFamily.sansMedium, fontSize: fontSize.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.glass700,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
    minHeight: 52,
  },
  flex: { flex: 1 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.glass700, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingHorizontal: spacing.md, minHeight: 52 },
  at: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, marginRight: 4 },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textSecondary, fontFamily: fontFamily.sansSemiBold, fontSize: fontSize.section },
});
