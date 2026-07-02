import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { SparkDelivery } from '@momeants/types';
import { ScreenShell } from '../../src/components/core/ScreenShell';
import { SparkCard } from '../../src/components/spark/SparkCard';
import { SparkPill } from '../../src/components/spark/SparkPill';
import { SpringPressable } from '../../src/components/core/SpringPressable';
import { useApi } from '../../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii, spring } from '@momeants/design';

const CATEGORY_FILTERS = ['All', 'Conversation', 'Family', 'Couple', 'Creative', 'Memory', 'Photo'];

export default function SparksScreen() {
  const api = useApi();
  const router = useRouter();
  const [todaySpark, setTodaySpark] = useState<SparkDelivery | null>(null);
  const [history, setHistory] = useState<SparkDelivery[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const [spark, hist] = await Promise.all([
      api.getTodaySpark(),
      api.getSparkHistory(20),
    ]);
    setTodaySpark(spark);
    setHistory(hist);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const completedSparks = history.filter((d) => d.status === 'completed');

  // Compute streak: consecutive days with at least one completion
  const streak = (() => {
    const completedDates = completedSparks
      .map((d) => new Date(d.deliveredAt).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let count = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    for (const dateStr of completedDates) {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === checkDate.getTime()) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }
    return count;
  })();

  return (
    <ScreenShell edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.auraPurple}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.springify().damping(spring.damping).stiffness(spring.stiffness)}
          style={styles.header}
        >
          <SpringPressable
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go Back"
          >
            <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
          </SpringPressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Sparks</Text>
            <Text style={styles.subtitle}>Little prompts to help you connect.</Text>
          </View>
        </Animated.View>

        {/* Stats bar */}
        <View style={styles.statsRow}>
          {[
            { label: 'Completed', value: completedSparks.length },
            { label: 'Streak', value: streak > 0 ? `${streak}d` : '—' },
            { label: 'Favorites', value: '—' },
          ].map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's spark */}
        {todaySpark && todaySpark.status !== 'dismissed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Spark</Text>
            <SparkCard
              delivery={todaySpark}
              onAccept={(id) => {
                api.acceptSpark(id);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.push(`/spark/${id}`);
              }}
              onDismiss={(id) => {
                api.dismissSpark(id);
                setTodaySpark(null);
              }}
            />
          </View>
        )}

        {/* Category filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse By Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRail}
          >
            {CATEGORY_FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedFilter(f);
                }}
                style={[styles.filterChip, selectedFilter === f && styles.filterChipActive]}
                accessibilityRole="button"
                accessibilityLabel={f}
                accessibilityState={{ selected: selectedFilter === f }}
              >
                <Text style={[styles.filterText, selectedFilter === f && styles.filterTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* History / past sparks */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Sparks</Text>
            <View style={styles.historyList}>
              {history.map((delivery, i) => (
                <SparkPill
                  key={delivery.id}
                  delivery={delivery}
                  index={i}
                  onPress={() => router.push(`/spark/${delivery.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.md, paddingHorizontal: spacing.lg, gap: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  backIcon: { color: colors.textMuted, fontSize: 22 },
  headerText: { flex: 1, gap: 4 },
  title: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.display,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.glass800,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.title,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.micro,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.section,
  },
  filterRail: { gap: spacing.sm, paddingVertical: spacing.xs },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: colors.auraPurple,
    backgroundColor: 'rgba(181,124,255,0.12)',
  },
  filterText: {
    color: colors.textMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
  filterTextActive: { color: colors.auraPurple },
  historyList: { gap: spacing.sm },
  historyCard: {
    backgroundColor: colors.glass800,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: spacing.md,
    gap: 4,
  },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.body,
    flex: 1,
    marginRight: spacing.sm,
  },
  historyCat: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  statusDone: { backgroundColor: 'rgba(76,175,80,0.12)' },
  statusDismissed: { backgroundColor: 'rgba(255,255,255,0.05)' },
  statusText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
  },
  tabBarSpacer: { height: 120 },
});
