import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenShell } from '../../src/components/core';
import { Skeleton } from '../../src/components/core/SkeletonLoader';
import { useApi } from '../../src/context/ApiContext';
import type { CalendarEvent, CalendarInference, CalendarNudge } from '@momeants/types';
import { colors } from '@momeants/design/src/colors';
import { spacing, radii } from '@momeants/design/src/spacing';
import { fontSize, fontFamily } from '@momeants/design/src/typography';
import { runCalendarIntelligence } from '../../src/engines/calendarIntelligenceEngine';
import type { EngineContext } from '../../src/engines/types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TYPE_COLORS: Record<string, string> = {
  birthday: '#FF7AC8',
  anniversary: '#FF6E91',
  holiday: '#FFD28A',
  memory_anniversary: '#B57CFF',
  trip: '#78A7FF',
  clique_event: '#78A7FF',
  custom: '#FFB38A',
};

function EventCard({ event }: { event: CalendarEvent }) {
  const router = useRouter();
  const accent = TYPE_COLORS[event.type] ?? colors.auraPurple;
  const dateObj = new Date(event.date + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysUntil = Math.ceil((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <TouchableOpacity
      style={[styles.eventCard, { borderLeftColor: accent }]}
      activeOpacity={0.8}
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (event.momentId) router.push(`/moment/${event.momentId}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={event.title}
    >
      <View style={styles.eventLeft}>
        <Text style={styles.eventEmoji}>{event.emoji ?? '📅'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.description ? <Text style={styles.eventSub}>{event.description}</Text> : null}
          {event.personName ? <Text style={styles.eventSub}>{event.personName}</Text> : null}
          {event.cliqueName ? <Text style={styles.eventSub}>{event.cliqueName}</Text> : null}
        </View>
      </View>
      <View style={styles.eventRight}>
        <Text style={[styles.eventDate, { color: accent }]}>{dateStr}</Text>
        {daysUntil >= 0 && daysUntil <= 30 && (
          <Text style={styles.eventCountdown}>
            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function CalendarScreen() {
  const api = useApi();
  const now = new Date();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [inferences, setInferences] = useState<CalendarInference[]>([]);
  const [calNudges, setCalNudges] = useState<CalendarNudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const year = now.getFullYear();

  async function load() {
    const evts = await api.listCalendarEvents();
    setEvents(evts);
    const ctx: EngineContext = {
      userId: 'me',
      currentTime: new Date(),
      moments: [],
      circleMembers: [],
      cliques: [],
      circleMoments: [],
      conversations: [],
      sparkHistory: [],
      availableSparks: [],
      calendarEvents: evts,
      seenFeedItemIds: new Set(),
      dismissedSparkIds: new Set(),
      seenSponsoredIds: new Map(),
      relationshipWeights: [],
      socialGraph: new Map(),
      sponsoredItems: [],
      discoveryMoments: [],
      userInterestSignals: [],
    };
    const { inferences: inf, nudges } = runCalendarIntelligence(ctx);
    setInferences(inf);
    setCalNudges(nudges);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const monthEvents = useMemo(
    () =>
      events
        .filter((e) => new Date(e.date + 'T00:00:00').getMonth() === selectedMonth)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events, selectedMonth]
  );

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => new Date(e.date + 'T00:00:00').getTime() >= Date.now())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
    [events]
  );

  if (loading) {
    return (
      <ScreenShell edges={['top']}>
        <Text style={[styles.title, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>Calendar</Text>
        <View style={{ padding: spacing.lg, gap: spacing.sm }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={72} borderRadius={16} />)}
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.auraPurple} />
        }
      >
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Moments that matter, every day.</Text>

        {/* Month rail */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthRail}
          style={styles.monthRailWrap}
        >
          {MONTHS.map((m, i) => (
            <TouchableOpacity
              key={m}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedMonth(i);
              }}
              style={[styles.monthChip, i === selectedMonth && styles.monthChipActive]}
              accessibilityRole="button"
              accessibilityLabel={m}
              accessibilityState={{ selected: i === selectedMonth }}
            >
              <Text style={[styles.monthText, i === selectedMonth && styles.monthTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {inferences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested dates</Text>
            {inferences.map((inf, i) => (
              <View key={`${inf.momentId}-${i}`} style={styles.inferenceCard}>
                <View style={styles.inferenceLeft}>
                  <Text style={styles.inferenceEmoji}>{inf.suggestedEmoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inferenceTitle}>{inf.suggestedTitle}</Text>
                    <Text style={styles.inferenceDate}>{inf.suggestedDate}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    await (api as any).confirmCalendarInference(inf);
                    setInferences((prev) => prev.filter((_, idx) => idx !== i));
                  }}
                  style={styles.inferenceAddBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${inf.suggestedTitle} to calendar`}
                  accessibilityHint="Double tap to add this suggested date to your calendar"
                >
                  <Text style={styles.inferenceAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {calNudges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming Up</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.nudgeStrip}
            >
              {calNudges.map((nudge, i) => (
                <View key={i} style={styles.nudgeChip}>
                  <Text style={styles.nudgeHeadline}>{nudge.headline}</Text>
                  <Text style={styles.nudgeSubtext}>{nudge.subtext}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your events</Text>
            {upcoming.slice(0, 3).map((e) => <EventCard key={e.id} event={e} />)}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{MONTH_NAMES[selectedMonth]} {year}</Text>
          {monthEvents.length === 0 ? (
            <View style={styles.emptyMonth}>
              <Text style={styles.emptyText}>Nothing this month — yet.</Text>
            </View>
          ) : (
            monthEvents.map((e) => <EventCard key={e.id} event={e} />)
          )}
        </View>

        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.md, gap: spacing.xl, paddingBottom: 40 },
  title: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.title, paddingHorizontal: spacing.lg },
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.sm, paddingHorizontal: spacing.lg, marginTop: -spacing.md },
  monthRailWrap: { maxHeight: 52 },
  monthRail: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    minHeight: 44,
    justifyContent: 'center',
  },
  monthChipActive: { borderColor: colors.auraPurple, backgroundColor: 'rgba(181,124,255,0.12)' },
  monthText: { color: colors.textMuted, fontFamily: fontFamily.sansMedium, fontSize: fontSize.caption },
  monthTextActive: { color: colors.auraPurple },
  section: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  sectionTitle: { color: colors.textSecondary, fontFamily: fontFamily.sansSemiBold, fontSize: fontSize.section, marginBottom: spacing.xs },
  eventCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderLeftWidth: 3,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLeft: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flex: 1 },
  eventEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  eventTitle: { color: colors.textPrimary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.md },
  eventSub: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.xs, marginTop: 2 },
  eventRight: { alignItems: 'flex-end', gap: 2 },
  eventDate: { fontFamily: fontFamily.sansMedium, fontSize: fontSize.sm },
  eventCountdown: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  emptyMonth: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.sm },
  tabBarSpacer: { height: 120 },
});
