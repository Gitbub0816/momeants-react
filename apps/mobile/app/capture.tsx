import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { MoodTag, MomentVisibility, MomentPerson, MomentLocation } from '@momeants/types';
import { MoodSelector } from '../src/components/memory';
import { MomentPrivacyPicker } from '../src/components/capture';
import { MomeantsButton, GlassCard } from '../src/components/core';
import { useApi } from '../src/context/ApiContext';
import { colors, gradients, fontFamily, fontSize, spacing, radii } from '@momeants/design';
import { moderateMoment } from '../src/engines/moderationEngine';
import { enqueueMoment } from '../src/hooks/useOfflineQueue';
import type { CircleMember } from '@momeants/types';

const { width } = Dimensions.get('window');

type Step = 'photo' | 'mood' | 'people' | 'location' | 'caption' | 'privacy' | 'saving';

const STEP_ORDER: Step[] = ['photo', 'mood', 'people', 'location', 'caption', 'privacy', 'saving'];

export default function CaptureScreen() {
  const router = useRouter();
  const api = useApi();

  const [step, setStep] = useState<Step>('photo');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [moods, setMoods] = useState<MoodTag[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<CircleMember[]>([]);
  const [peopleSearch, setPeopleSearch] = useState('');
  const [location, setLocation] = useState<MomentLocation | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<MomentVisibility>('close_circle');
  const [saving, setSaving] = useState(false);
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);

  useEffect(() => {
    api.listCircleMembers().then(setCircleMembers).catch(() => {});
  }, [api]);

  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) {
      setStep(STEP_ORDER[idx - 1]);
    } else {
      router.back();
    }
  }

  async function launchCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera permission required', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
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

  function togglePerson(member: CircleMember) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPeople(prev => {
      const exists = prev.find(p => p.id === member.id);
      if (exists) return prev.filter(p => p.id !== member.id);
      return [...prev, member];
    });
  }

  async function useCurrentLocation() {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission required', 'Please allow location access in Settings.');
        setLocationLoading(false);
        return;
      }
      const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geocode = await Location.reverseGeocodeAsync({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });
      const place = geocode[0];
      const label = [place?.name, place?.city, place?.country].filter(Boolean).join(', ') || 'Current location';
      setLocation({
        label,
        city: place?.city ?? undefined,
        country: place?.country ?? undefined,
        lat: coords.coords.latitude,
        lng: coords.coords.longitude,
      });
      setManualLocation(label);
    } catch {
      Alert.alert('Could not get location', 'Please enter it manually.');
    } finally {
      setLocationLoading(false);
    }
  }

  function applyManualLocation() {
    const trimmed = manualLocation.trim();
    if (trimmed) {
      setLocation({ label: trimmed });
    } else {
      setLocation(null);
    }
  }

  async function handleSave() {
    if (!imageUri) return;
    setSaving(true);
    setStep('saving');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const people: MomentPerson[] = selectedPeople.map(m => ({
      id: m.id,
      name: m.displayName,
      avatarUri: m.avatarUri,
    }));

    // Moderation gate
    const now = new Date().toISOString();
    const draft: import('@momeants/types').Moment = {
      id: 'draft',
      authorId: 'me',
      imageUri,
      caption: caption.trim() || undefined,
      moods,
      visibility,
      people,
      location: location ?? undefined,
      reactions: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      const modResult = await moderateMoment(draft, {
        enableImageModeration: false,
        enableTextModeration: true,
        strictnessLevel: 'standard',
      });

      if (modResult.tier === 'auto_reject') {
        const reason = modResult.signals.map(s => s.category).join(', ') || 'prohibited content';
        Alert.alert('Cannot post this moment', `This content cannot be shared (${reason}).`);
        setSaving(false);
        setStep('privacy');
        return;
      }

      if (modResult.tier === 'review_required') {
        await new Promise<void>(resolve => {
          Alert.alert(
            'Content review',
            'This will be reviewed before appearing in feeds.',
            [{ text: 'OK', onPress: () => resolve() }],
          );
        });
      }

      const momentInput = {
        imageUri,
        caption: caption.trim() || undefined,
        moods,
        visibility,
        people,
        location: location ?? undefined,
      };

      try {
        await api.createMoment(momentInput);
        router.replace('/(tabs)/home');
      } catch (err) {
        // Only treat genuine connectivity failures as "save for later". Any
        // other error (RLS, validation, storage, server) must surface so the
        // user is never told a broken moment succeeded.
        const message = err instanceof Error ? err.message : String(err);
        const isNetworkError = /network request failed|network error|failed to fetch|timed? ?out|offline/i.test(message);
        if (isNetworkError) {
          await enqueueMoment(momentInput);
          Alert.alert(
            'Saved for later',
            'No connection — your moment is saved and will upload automatically when you reconnect.',
            [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
          );
        } else {
          Alert.alert('Could not save moment', message || 'Something went wrong. Please try again.');
          setSaving(false);
          setStep('privacy');
        }
      }
    } catch {
      Alert.alert('Could not save', 'Please try again.');
      setSaving(false);
      setStep('privacy');
    }
  }

  // ─── Photo step ───────────────────────────────────────────────────────────
  if (step === 'photo') {
    return (
      <LinearGradient colors={gradients.background} style={styles.fill}>
        <View style={styles.photoScreen}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.photoCenter}>
            <Text style={styles.captureTitle}>Your first momeant{'\n'}is waiting.</Text>
            <Text style={styles.captureSubtitle}>Start with one photo that feels like today.</Text>

            <View style={styles.photoOptions}>
              <TouchableOpacity
                onPress={launchCamera}
                style={styles.photoOptionBtn}
                accessibilityRole="button"
                accessibilityLabel="Take photo"
              >
                <LinearGradient colors={gradients.aura} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.photoOptionGradient}>
                  <Ionicons name="camera-outline" size={30} color={colors.auraLavender} />
                </LinearGradient>
                <Text style={styles.photoOptionLabel}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImage}
                style={styles.photoOptionBtn}
                accessibilityRole="button"
                accessibilityLabel="Choose from library"
              >
                <View style={styles.photoOptionGlass}>
                  <Ionicons name="images-outline" size={30} color={colors.auraLavender} />
                </View>
                <Text style={styles.photoOptionLabel}>Choose from Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // ─── Saving step ──────────────────────────────────────────────────────────
  if (step === 'saving') {
    return (
      <LinearGradient colors={gradients.background} style={styles.fill}>
        <View style={styles.savingCenter}>
          <Ionicons name="sparkles" size={34} color={colors.auraPurple} />
          <Text style={styles.savingText}>Saving your moment…</Text>
        </View>
      </LinearGradient>
    );
  }

  // ─── Filtered people list ─────────────────────────────────────────────────
  const filteredMembers = circleMembers.filter(m =>
    m.displayName.toLowerCase().includes(peopleSearch.toLowerCase()),
  );

  // ─── Composer steps ───────────────────────────────────────────────────────
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
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {step !== 'mood' && (
            <TouchableOpacity onPress={goBack} style={styles.backSmall} accessibilityLabel="Back">
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.composerContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Mood step ── */}
          {step === 'mood' && (
            <GlassCard style={styles.stepCard}>
              <Text style={styles.stepTitle}>How does this feel?</Text>
              <Text style={styles.stepSub}>Pick up to 3 feelings.</Text>
              <MoodSelector selected={moods} onChange={setMoods} />
              <MomeantsButton
                label="Continue"
                onPress={() => setStep('people')}
                disabled={moods.length === 0}
                style={styles.stepCta}
              />
            </GlassCard>
          )}

          {/* ── People step ── */}
          {step === 'people' && (
            <GlassCard style={styles.stepCard}>
              <Text style={styles.stepTitle}>Who's in this moment?</Text>
              <Text style={styles.stepSub}>Tag people from your circle.</Text>

              {selectedPeople.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {selectedPeople.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => togglePerson(p)}
                      style={styles.selectedChip}
                      accessibilityLabel={`Remove ${p.displayName}`}
                    >
                      <Text style={styles.chipText}>{p.displayName}</Text>
                      <Ionicons name="close" size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <TextInput
                value={peopleSearch}
                onChangeText={setPeopleSearch}
                style={styles.searchInput}
                placeholder="Search your circle…"
                placeholderTextColor={colors.textMuted}
                autoCorrect={false}
              />

              <View style={styles.memberList}>
                {filteredMembers.map(member => {
                  const isSelected = !!selectedPeople.find(p => p.id === member.id);
                  return (
                    <TouchableOpacity
                      key={member.id}
                      onPress={() => togglePerson(member)}
                      style={[styles.memberRow, isSelected && styles.memberRowSelected]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={member.displayName}
                    >
                      <View style={[styles.memberCheck, isSelected && styles.memberCheckActive]}>
                        {isSelected && <Ionicons name="checkmark" size={16} color={colors.auraPurple} />}
                      </View>
                      <Text style={[styles.memberName, isSelected && styles.memberNameActive]}>
                        {member.displayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <MomeantsButton
                label="Continue"
                onPress={() => setStep('location')}
                style={styles.stepCta}
              />
              <MomeantsButton
                label="Skip"
                onPress={() => setStep('location')}
                variant="quiet"
              />
            </GlassCard>
          )}

          {/* ── Location step ── */}
          {step === 'location' && (
            <GlassCard style={styles.stepCard}>
              <Text style={styles.stepTitle}>Where were you?</Text>
              <Text style={styles.stepSub}>Add a location to this moment.</Text>

              {location && (
                <View style={styles.locationBadge}>
                  <Text style={styles.locationBadgeText}><Ionicons name="location-outline" size={13} color={colors.auraLavender} /> {location.label}</Text>
                  <TouchableOpacity onPress={() => { setLocation(null); setManualLocation(''); }} accessibilityLabel="Clear location">
                    <Text style={styles.locationBadgeClear}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <MomeantsButton
                label={locationLoading ? 'Getting location…' : 'Use current location'}
                onPress={useCurrentLocation}
                variant="glass"
                disabled={locationLoading}
                style={styles.locationBtn}
              />
              {locationLoading && <ActivityIndicator color={colors.auraPurple} style={{ marginTop: spacing.xs }} />}

              <Text style={styles.orDivider}>— or type it manually —</Text>

              <TextInput
                value={manualLocation}
                onChangeText={setManualLocation}
                onBlur={applyManualLocation}
                style={styles.searchInput}
                placeholder="e.g. Brooklyn, New York"
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={applyManualLocation}
              />

              <MomeantsButton
                label="Continue"
                onPress={() => setStep('caption')}
                style={styles.stepCta}
              />
              <MomeantsButton
                label="Skip"
                onPress={() => setStep('caption')}
                variant="quiet"
              />
            </GlassCard>
          )}

          {/* ── Caption step ── */}
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

          {/* ── Privacy step ── */}
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
  photoCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  captureTitle: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.display,
    textAlign: 'center',
    lineHeight: 42,
  },
  captureSubtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, textAlign: 'center' },
  photoOptions: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  photoOptionBtn: { alignItems: 'center', gap: spacing.sm },
  photoOptionGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionGlass: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.glass700,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionIcon: { fontSize: 32 },
  photoOptionLabel: { color: colors.textSecondary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.caption, textAlign: 'center', maxWidth: 80 },
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
  // People
  chipRow: { flexDirection: 'row', marginBottom: spacing.xs },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass700,
    borderWidth: 1,
    borderColor: colors.auraPurple,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginRight: spacing.xs,
  },
  chipText: { color: colors.textPrimary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.caption },
  chipRemove: { color: colors.textMuted, fontSize: fontSize.micro },
  searchInput: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
    backgroundColor: colors.glass800,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberList: { gap: spacing.xs },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  memberRowSelected: { backgroundColor: 'rgba(139, 92, 246, 0.12)' },
  memberCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberCheckActive: { borderColor: colors.auraPurple, backgroundColor: colors.auraPurple },
  memberCheckMark: { color: colors.textPrimary, fontSize: 12, fontFamily: fontFamily.sansSemiBold },
  memberName: { color: colors.textSecondary, fontFamily: fontFamily.sans, fontSize: fontSize.body },
  memberNameActive: { color: colors.textPrimary, fontFamily: fontFamily.sansMedium },
  // Location
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.auraPurple,
  },
  locationBadgeText: { color: colors.textPrimary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.body, flex: 1 },
  locationBadgeClear: { color: colors.textMuted, fontSize: 16, paddingLeft: spacing.sm },
  locationBtn: {},
  orDivider: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption, textAlign: 'center' },
  // Caption
  captionInput: {
    color: colors.textPrimary,
    fontFamily: fontFamily.serifRegular,
    fontSize: fontSize.body,
    lineHeight: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro, textAlign: 'right' },
  // Saving
  savingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  savingIcon: { color: colors.auraPurple, fontSize: 48 },
  savingText: { color: colors.textSecondary, fontFamily: fontFamily.serifRegular, fontSize: fontSize.title },
});
