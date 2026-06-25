import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenShell } from '../../src/components/core';
import { DEMO_CALENDAR_EVENTS } from '../../src/demo/calendar';
import type { CalendarEvent } from '@momeants/types';
import { colors } from '@momeants/design/src/colors';
import { spacing, radii } from '@momeants/design/src/spacing';
import { fontSize, fontFamily } from '@momeants/design/src/typography';

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
        <View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.description ? (
            <Text style={styles.eventDesc}>{event.description}</Text>
          ) : null}
          {event.personName ? (
            <Text style={styles.eventSub}>{event.personName}</Text>
          ) : null}
          {event.cliqueName ? (
            <Text style={styles.eventSub}>{event.cliqueName}</Text>
          ) : null}
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
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const year = now.getFullYear();

  const monthEvents = useMemo(() => {
    return DEMO_CALENDAR_EVENTS.filter((e) => {
      const m = new Date(e.date + 'T00:00:00').getMonth();
      return m === selectedMonth;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedMonth]);

  const upcoming = useMemo(() => {
    const today = Date.now();
    return DEMO_CALENDAR_EVENTS
      .filter((e) => new Date(e.date + 'T00:00:00').getTime() >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, []);

  return (
    <ScreenShell edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
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

        {/* Upcoming next */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming Up</Text>
            {upcoming.slice(0, 3).map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </View>
        )}

        {/* Month events */}
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
  title: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.title,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.md,
  },
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
  sectionTitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.section,
    marginBottom: spacing.xs,
  },
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
  eventDesc: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.xs, marginTop: 2 },
  eventSub: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.xs, marginTop: 1 },
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
  emptyMonth: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.sm },
  tabBarSpacer: { height: 120 },
});
