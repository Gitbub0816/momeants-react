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
import { LinearGradient } from 'expo-linear-gradient';
import type { SparkDelivery } from '@momeants/types';
import { ScreenShell } from '../../src/components/core/ScreenShell';
import { SparkCard } from '../../src/components/spark/SparkCard';
import { useApi } from '../../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii, gradients } from '@momeants/design';

const CATEGORY_FILTERS = ['All', 'Conversation', 'Family', 'Couple', 'Creative', 'Memory', 'Photo'];

const CATEGORY_COLORS: Record<string, string> = {
  conversation: '#78A7FF',
  family: '#FFB38A',
  couple: '#FF6E91',
  creative: '#78A7FF',
  memory: '#B57CFF',
  photo: '#FF7AC8',
  relationship: '#B57CFF',
  holiday: '#FFD28A',
};

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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Sparks</Text>
            <Text style={styles.subtitle}>Little prompts to help you connect.</Text>
          </View>
        </View>

        {/* Stats bar */}
        <View style={styles.statsRow}>
          {[
            { label: 'Completed', value: completedSparks.length },
            { label: 'Streak', value: '3 days' },
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
          <Text style={styles.sectionTitle}>Browse by category</Text>
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
            <Text style={styles.sectionTitle}>Past sparks</Text>
            <View style={styles.historyList}>
              {history.map((delivery) => {
                const cat = delivery.spark?.category ?? 'conversation';
                const color = CATEGORY_COLORS[cat] ?? colors.auraPurple;
                return (
                  <View key={delivery.id} style={[styles.historyCard, { borderLeftColor: color }]}>
                    <View style={styles.historyTop}>
                      <Text style={styles.historyTitle} numberOfLines={1}>
                        {delivery.spark?.title ?? 'Spark'}
                      </Text>
                      <View style={[styles.statusBadge, delivery.status === 'completed' ? styles.statusDone : styles.statusDismissed]}>
                        <Text style={[styles.statusText, { color: delivery.status === 'completed' ? '#4CAF50' : colors.textMuted }]}>
                          {delivery.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.historyCat}>{cat}</Text>
                  </View>
                );
              })}
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
