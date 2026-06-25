import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { Moment, CircleMember, SparkDelivery } from '@momeants/types';
import { ScreenShell } from '../../src/components/core';
import { HomeScreenSkeleton } from '../../src/components/core/SkeletonLoader';
import { EmptyState } from '../../src/components/core/EmptyState';
import { MemoryHeroCard, MemoryMiniCard } from '../../src/components/memory';
import { CloseCircleStrip } from '../../src/components/circle';
import { SparkCard } from '../../src/components/spark/SparkCard';
import { useApi } from '../../src/context/ApiContext';
import { useRouter } from 'expo-router';
import { colors, fontFamily, fontSize, spacing } from '@momeants/design';

export default function HomeScreen() {
  const api = useApi();
  const router = useRouter();
  const [hero, setHero] = useState<Moment | null>(null);
  const [recent, setRecent] = useState<Moment[]>([]);
  const [resurfaced, setResurfaced] = useState<Moment | null>(null);
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);
  const [spark, setSpark] = useState<SparkDelivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [home, members, todaySpark] = await Promise.all([
        api.listHomeMoments(),
        api.listCircleMembers(),
        api.getTodaySpark(),
      ]);
      setHero(home.hero);
      setRecent(home.recent);
      setResurfaced(home.resurfaced ?? null);
      setCircleMembers(members);
      setSpark(todaySpark);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <ScreenShell edges={['top']}>
        <View style={styles.skeletonPad}>
          <HomeScreenSkeleton />
        </View>
      </ScreenShell>
    );
  }

  if (!hero) {
    return (
      <ScreenShell edges={['top']}>
        <Text style={styles.wordmark}>momeants</Text>
        <EmptyState
          icon="📷"
          title="No moments yet"
          body="Capture your first moment — a photo, a feeling, a place."
          actionLabel="Capture a moment"
          onAction={() => router.push('/capture')}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.wordmark}>momeants</Text>

        {spark && spark.status !== 'dismissed' && spark.status !== 'completed' && (
          <SparkCard
            delivery={spark}
            onAccept={(id) => api.acceptSpark(id)}
            onDismiss={(id) => {
              api.dismissSpark(id);
              setSpark(null);
            }}
          />
        )}

        {resurfaced && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>✦ {resurfaced.resurfaceLabel ?? 'A memory for you'}</Text>
            <MemoryHeroCard moment={resurfaced} />
          </View>
        )}

        {hero && !resurfaced && (
          <View style={styles.section}>
            <MemoryHeroCard moment={hero} />
          </View>
        )}

        {circleMembers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your circle</Text>
            <CloseCircleStrip members={circleMembers} />
          </View>
        )}

        {recent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent moments</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniRow}>
              {recent.map((m) => (
                <MemoryMiniCard key={m.id} moment={m} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  skeletonPad: { flex: 1, paddingTop: spacing.md },
  scroll: { paddingTop: spacing.md, gap: spacing.xl },
  wordmark: {
    color: colors.auraPurple,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.title,
    paddingHorizontal: spacing.lg,
    marginBottom: -spacing.sm,
  },
  section: { gap: spacing.sm },
  sectionLabel: {
    color: colors.auraPurple,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
    paddingHorizontal: spacing.lg,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.section,
    paddingHorizontal: spacing.lg,
  },
  miniRow: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  tabBarSpacer: { height: 120 },
});
