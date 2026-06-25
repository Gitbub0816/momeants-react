import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { MoodTag, MomentVisibility } from '@momeants/types';
import { MoodSelector } from '../src/components/memory';
import { MomentPrivacyPicker } from '../src/components/capture';
import { MomeantsButton, GlassCard } from '../src/components/core';
import { useApi } from '../src/context/ApiContext';
import { colors, gradients, fontFamily, fontSize, spacing, radii } from '@momeants/design';

const { width, height } = Dimensions.get('window');

type Step = 'photo' | 'mood' | 'caption' | 'privacy' | 'saving';

export default function CaptureScreen() {
  const router = useRouter();
  const api = useApi();

  const [step, setStep] = useState<Step>('photo');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [moods, setMoods] = useState<MoodTag[]>([]);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<MomentVisibility>('close_circle');
  const [saving, setSaving] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setImageUri(result.assets[0].uri);
      setStep('mood');
    }
  }

  async function handleSave() {
    if (!imageUri) return;
    setSaving(true);
    setStep('saving');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await api.createMoment({
        imageUri,
        caption: caption.trim() || undefined,
        moods,
        visibility,
        people: [],
      });
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Could not save', 'Please try again.');
      setSaving(false);
      setStep('privacy');
    }
  }

  if (step === 'photo') {
    return (
      <LinearGradient colors={gradients.background} style={styles.fill}>
        <View style={styles.photoScreen}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            accessibilityLabel="Close"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.photoCenter}>
            <Text style={styles.captureTitle}>Your first momeant{'\n'}is waiting.</Text>
            <Text style={styles.captureSubtitle}>Start with one photo that feels like today.</Text>

            <TouchableOpacity
              onPress={pickImage}
              style={styles.pickBtn}
              accessibilityRole="button"
              accessibilityLabel="Choose a photo"
            >
              <LinearGradient colors={gradients.aura} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pickBtnGradient}>
                <Text style={styles.pickBtnIcon}>+</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.pickBtnLabel}>Choose a photo</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  if (step === 'saving') {
    return (
      <LinearGradient colors={gradients.background} style={styles.fill}>
        <View style={styles.savingCenter}>
          <Text style={styles.savingIcon}>✦</Text>
          <Text style={styles.savingText}>Saving your moment…</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
      <LinearGradient colors={gradients.background} style={styles.fill}>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.bgImage}
            contentFit="cover"
            blurRadius={step === 'mood' ? 0 : 20}
          />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,7,17,0.55)' }]} />

        <View style={styles.composerHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeSmall} accessibilityLabel="Close">
            <Text style={styles.closeSmallText}>✕</Text>
          </TouchableOpacity>

          {step !== 'mood' && (
            <TouchableOpacity onPress={() => {
              if (step === 'caption') setStep('mood');
              else if (step === 'privacy') setStep('caption');
            }} style={styles.backSmall} accessibilityLabel="Back">
              <Text style={styles.closeSmallText}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.composerContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'mood' && (
            <GlassCard style={styles.stepCard}>
              <Text style={styles.stepTitle}>How does this feel?</Text>
              <Text style={styles.stepSub}>Pick up to 3 feelings.</Text>
              <MoodSelector selected={moods} onChange={setMoods} />
              <MomeantsButton
                label="Continue"
                onPress={() => setStep('caption')}
                disabled={moods.length === 0}
                style={styles.stepCta}
              />
            </GlassCard>
          )}

          {step === 'caption' && (
            <GlassCard style={styles.stepCard}>
              <Text style={styles.stepTitle}>Add a caption</Text>
              <Text style={styles.stepSub}>What do you want to remember about this?</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                style={styles.captionInput}
                placeholder="Write something honest…"
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={280}
                autoFocus
              />
              <Text style={styles.charCount}>{caption.length} / 280</Text>
              <MomeantsButton
                label="Continue"
                onPress={() => setStep('privacy')}
                style={styles.stepCta}
              />
              <MomeantsButton
                label="Skip caption"
                onPress={() => setStep('privacy')}
                variant="quiet"
              />
            </GlassCard>
          )}

          {step === 'privacy' && (
            <GlassCard style={styles.stepCard}>
              <MomentPrivacyPicker value={visibility} onChange={setVisibility} />
              <MomeantsButton
                label="Save this moment"
                onPress={handleSave}
                loading={saving}
                style={styles.stepCta}
              />
            </GlassCard>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  photoScreen: { flex: 1, paddingTop: 60, paddingHorizontal: spacing.lg },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: colors.textSecondary, fontSize: 18 },
  photoCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  captureTitle: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.display,
    textAlign: 'center',
    lineHeight: 42,
  },
  captureSubtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, textAlign: 'center' },
  pickBtn: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden' },
  pickBtnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pickBtnIcon: { color: colors.textPrimary, fontSize: 40, lineHeight: 48 },
  pickBtnLabel: { color: colors.textSecondary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.body },
  bgImage: { ...StyleSheet.absoluteFillObject },
  composerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  closeSmall: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backSmall: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeSmallText: { color: colors.textSecondary, fontSize: 20 },
  composerContent: { padding: spacing.lg, justifyContent: 'flex-end', flexGrow: 1, paddingBottom: spacing.xl },
  stepCard: { padding: spacing.lg, gap: spacing.md },
  stepTitle: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.title },
  stepSub: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body },
  stepCta: { marginTop: spacing.xs },
  captionInput: {
    color: colors.textPrimary,
    fontFamily: fontFamily.serifRegular,
    fontSize: fontSize.body,
    lineHeight: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro, textAlign: 'right' },
  savingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  savingIcon: { color: colors.auraPurple, fontSize: 48 },
  savingText: { color: colors.textSecondary, fontFamily: fontFamily.serifRegular, fontSize: fontSize.title },
});
