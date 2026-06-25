import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { SparkDelivery } from '@momeants/types';
import { useApi } from '../../src/context/ApiContext';
import { colors } from '@momeants/design/src/colors';
import { spacing, radii } from '@momeants/design/src/spacing';
import { fontSize, fontFamily } from '@momeants/design/src/typography';
import { GlassCard } from '../../src/components/core/GlassCard';

const CATEGORY_ICON: Record<string, string> = {
  conversation: '💬',
  memory: '✨',
  relationship: '🤝',
  holiday: '🎉',
  anniversary: '🎂',
  seasonal: '🌿',
  location: '📍',
  family: '👨‍👩‍👧',
  friendship: '🫂',
  couple: '💑',
  clique: '🙌',
  photo: '📸',
  storytelling: '📖',
  creative: '🎨',
  discovery: '🔍',
};

export default function SparkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();

  const [delivery, setDelivery] = useState<SparkDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    api.getTodaySpark().then((d) => {
      // Match by delivery id
      if (d && d.id === id) {
        setDelivery(d);
      }
      setLoading(false);
    });
  }, [id]);

  const handleNext = useCallback(async () => {
    if (!delivery?.spark.prompts) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentPromptIndex < delivery.spark.prompts.length - 1) {
      setCurrentPromptIndex((i) => i + 1);
    }
  }, [delivery, currentPromptIndex]);

  const handleComplete = useCallback(async () => {
    if (!delivery) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCompleting(true);
    try {
      await api.completeSpark(delivery.id);
      Alert.alert(
        'Spark Complete! ✨',
        'Want to capture this moment?',
        [
          {
            text: 'Capture Moment',
            onPress: () => router.replace('/capture'),
          },
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Could not complete spark. Try again.');
    } finally {
      setCompleting(false);
    }
  }, [delivery, api, router]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.auraPurple} />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Spark not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { spark } = delivery;
  const icon = CATEGORY_ICON[spark.category] ?? '✨';
  const prompts = spark.prompts ?? [];
  const hasPrompts = prompts.length > 0;
  const isLastPrompt = currentPromptIndex >= prompts.length - 1;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Spark',
          headerStyle: { backgroundColor: colors.ink900 },
          headerTintColor: colors.textPrimary,
          headerBackTitle: 'Back',
        }}
      />
      <LinearGradient
        colors={[colors.ink900, '#151B31', colors.ink900]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.headerBlock}>
              <Text style={styles.iconLarge}>{icon}</Text>
              <Text style={styles.category}>{spark.category.toUpperCase()}</Text>
              <Text style={styles.title}>{spark.title}</Text>
              <Text style={styles.description}>{spark.description}</Text>
            </View>

            {/* Meta chips */}
            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>~{spark.estimatedMinutes} min</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{spark.minPlayers}–{spark.maxPlayers} people</Text>
              </View>
              {spark.requiresPhoto && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>📸 Photo</Text>
                </View>
              )}
            </View>

            {/* Body instruction */}
            <GlassCard style={styles.bodyCard}>
              <Text style={styles.bodyText}>{spark.body}</Text>
            </GlassCard>

            {/* Prompts */}
            {hasPrompts && (
              <View style={styles.promptSection}>
                <Text style={styles.promptLabel}>
                  {currentPromptIndex + 1} of {prompts.length}
                </Text>
                <GlassCard style={styles.promptCard}>
                  <Text style={styles.promptText}>{prompts[currentPromptIndex]}</Text>
                </GlassCard>
                {!isLastPrompt && (
                  <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={handleNext}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Next prompt"
                  >
                    <Text style={styles.nextBtnText}>Next Prompt →</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* CTA */}
            {(!hasPrompts || isLastPrompt) && (
              <TouchableOpacity
                style={styles.completeWrapper}
                onPress={handleComplete}
                activeOpacity={0.85}
                disabled={completing}
                accessibilityRole="button"
                accessibilityLabel={spark.completionCta}
              >
                <LinearGradient
                  colors={[colors.auraPurple, colors.auraBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.completeGradient}
                >
                  {completing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.completeText}>{spark.completionCta}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  center: {
    flex: 1,
    backgroundColor: colors.ink900,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontFamily: fontFamily.sans,
  },
  backBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.lg,
  },
  backBtnText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansMedium,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconLarge: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  category: {
    color: colors.auraPurple,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.sansMedium,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.displaySM,
    fontFamily: fontFamily.serifBold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontFamily: fontFamily.sans,
    textAlign: 'center',
    lineHeight: 24,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.sans,
  },
  bodyCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  bodyText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fontFamily.sans,
    lineHeight: 26,
  },
  promptSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  promptLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.sansMedium,
    letterSpacing: 1,
    textAlign: 'center',
  },
  promptCard: {
    padding: spacing.lg,
  },
  promptText: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.serifBold,
    textAlign: 'center',
    lineHeight: 28,
  },
  nextBtn: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(181,124,255,0.15)',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.35)',
  },
  nextBtnText: {
    color: colors.auraPurple,
    fontSize: fontSize.md,
    fontFamily: fontFamily.sansMedium,
  },
  completeWrapper: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  completeGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  completeText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontFamily: fontFamily.sansMedium,
  },
});
