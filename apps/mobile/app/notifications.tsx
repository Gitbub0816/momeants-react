import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenShell, GlassCard } from '../src/components/core';
import { useApi } from '../src/context/ApiContext';
import type { Notification } from '@momeants/types';
import { colors, fontFamily, fontSize, spacing } from '@momeants/design';

export default function NotificationsScreen() {
  const router = useRouter();
  const api = useApi();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await api.listNotifications();
    setNotifications(data);
  }, [api]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    await api.markNotificationRead(id).catch(() => {});
  }

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go Back">
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.auraPurple} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.auraPurple} />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={30} color={colors.textMuted} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>All Quiet</Text>
              <Text style={styles.emptyDesc}>Memories will glow here when they resurface.</Text>
            </View>
          ) : (
            notifications.map((n) => {
              const isRead = !!n.readAt;
              return (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => markRead(n.id)}
                  accessibilityRole="button"
                  accessibilityLabel={n.title}
                  activeOpacity={0.75}
                >
                  <GlassCard style={isRead ? { ...styles.card, ...styles.cardRead } : styles.card}>
                    {!isRead && <View style={styles.unreadDot} />}
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, isRead && styles.cardTitleRead]}>{n.title}</Text>
                      <Text style={styles.cardBody} numberOfLines={2}>{n.body}</Text>
                      <Text style={styles.cardTime}>{formatTime(n.createdAt)}</Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
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
  title: { color: colors.textPrimary, fontFamily: fontFamily.serif, fontSize: fontSize.title },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  emptyTitle: { color: colors.textSecondary, fontFamily: fontFamily.serif, fontSize: fontSize.title },
  emptyDesc: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, textAlign: 'center' },
});
