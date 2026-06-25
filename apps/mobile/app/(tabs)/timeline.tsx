import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { TimelineGroup } from '@momeants/types';
import { ScreenShell, EmptyState, Skeleton } from '../../src/components/core';
import { useApi } from '../../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function TimelineScreen() {
  const api = useApi();
  const router = useRouter();
  const [groups, setGroups] = useState<TimelineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear] = useState(now.getFullYear());

  useEffect(() => {
    api.listTimeline({}).then((g) => {
      setGroups(g);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <ScreenShell edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Timeline</Text>
          <Text style={styles.year}>{selectedYear}</Text>
        </View>
        <View style={styles.skeletonGrid}>
          {[0,1,2,3,4,5,6,7,8].map((i) => (
            <Skeleton key={i} width={110} height={140} borderRadius={16} />
          ))}
        </View>
      </ScreenShell>
    );
  }

  if (groups.length === 0) {
    return (
      <ScreenShell edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Timeline</Text>
          <Text style={styles.year}>{selectedYear}</Text>
        </View>
        <EmptyState
          icon="📅"
          title="No memories yet"
          body="Your moments will appear here, grouped by day."
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <Text style={styles.year}>{selectedYear}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthRail}
        style={styles.monthRailWrap}
      >
        {MONTHS.map((m, i) => (
          <TouchableOpacity
            key={m}
            onPress={() => setSelectedMonth(i)}
            style={[styles.monthChip, i === selectedMonth && styles.monthChipActive]}
            accessibilityRole="button"
            accessibilityLabel={m}
            accessibilityState={{ selected: i === selectedMonth }}
          >
            <Text style={[styles.monthText, i === selectedMonth && styles.monthTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {groups.map((group) => (
          <View key={group.isoDate} style={styles.group}>
            <Text style={styles.dateLabel}>{group.dateLabel}</Text>
            <View style={styles.momentRow}>
              {group.moments.map((moment) => (
                <TouchableOpacity
                  key={moment.id}
                  onPress={() => router.push(`/moment/${moment.id}`)}
                  style={styles.momentThumb}
                  accessibilityRole="button"
                  accessibilityLabel={moment.caption ?? 'Memory'}
                >
                  <Image
                    source={{ uri: moment.thumbnailUri ?? moment.imageUri }}
                    style={styles.thumbImage}
                    contentFit="cover"
                    transition={200}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.title },
  year: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body },
  monthRailWrap: { maxHeight: 52, marginBottom: spacing.md },
  monthRail: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 44,
    justifyContent: 'center',
  },
  monthChipActive: { borderColor: colors.auraPurple, backgroundColor: 'rgba(181,124,255,0.12)' },
  monthText: { color: colors.textMuted, fontFamily: fontFamily.sansMedium, fontSize: fontSize.caption },
  monthTextActive: { color: colors.auraPurple },
  scroll: { paddingHorizontal: spacing.lg, gap: spacing.xl },
  group: { gap: spacing.sm },
  dateLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  momentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  momentThumb: {
    width: 110,
    height: 140,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.ink800,
  },
  thumbImage: { ...StyleSheet.absoluteFillObject },
  tabBarSpacer: { height: 120 },
});
