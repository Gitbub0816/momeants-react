import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, GlassCard } from '../src/components/core';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

// Placeholder notifications — real ones come from the notifications table via Supabase
const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'One year ago today', body: '"That golden hour when everything felt exactly right."', read: false, createdAt: '2025-06-25T08:00:00Z' },
  { id: '2', title: 'Ava shared a quiet moment with you', body: 'A memory from her afternoon in the garden.', read: false, createdAt: '2025-06-24T15:20:00Z' },
  { id: '3', title: 'A memory from last summer is glowing again', body: '"We laughed until our stomachs hurt."', read: true, createdAt: '2025-06-20T08:00:00Z' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>◎</Text>
            <Text style={styles.emptyTitle}>All quiet</Text>
            <Text style={styles.emptyDesc}>Memories will glow here when they resurface.</Text>
          </View>
        ) : (
          notifications.map((n) => (
            <TouchableOpacity
              key={n.id}
              onPress={() => markRead(n.id)}
              accessibilityRole="button"
              accessibilityLabel={n.title}
            >
              <GlassCard style={[styles.card, n.read && styles.cardRead]}>
                {!n.read && <View style={styles.unreadDot} />}
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, n.read && styles.cardTitleRead]}>{n.title}</Text>
                  <Text style={styles.cardBody} numberOfLines={2}>{n.body}</Text>
                  <Text style={styles.cardTime}>{formatTime(n.createdAt)}</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScreenShell>
  );
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { color: colors.textSecondary, fontSize: 24 },
  title: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.title },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xl },
  card: { padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  cardRead: { opacity: 0.65 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.auraPurple, marginTop: 6 },
  cardContent: { flex: 1, gap: 4 },
  cardTitle: { color: colors.textPrimary, fontFamily: fontFamily.sansSemiBold, fontSize: fontSize.body },
  cardTitleRead: { fontFamily: fontFamily.sans },
  cardBody: { color: colors.textMuted, fontFamily: fontFamily.serifRegular, fontSize: fontSize.caption, fontStyle: 'italic', lineHeight: 18 },
  cardTime: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120, gap: spacing.md },
  emptyIcon: { fontSize: 48, color: colors.textMuted },
  emptyTitle: { color: colors.textSecondary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.title },
  emptyDesc: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, textAlign: 'center' },
});
