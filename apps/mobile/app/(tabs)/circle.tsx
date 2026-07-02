import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { CircleMember } from '@momeants/types';

type ConnectionRequest = { userId: string; displayName: string; avatarUri?: string; sentAt: string };
import { ScreenShell, EmptyState, Skeleton, SpringPressable } from '../../src/components/core';
import { useApi } from '../../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii, gradients, spring } from '@momeants/design';

function MemberRow({ member, index }: { member: CircleMember; index: number }) {
  const router = useRouter();
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(spring.damping).stiffness(spring.stiffness)}
    >
      <SpringPressable
        style={styles.memberRow}
        haptic={false}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/profile/${member.id}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={member.displayName}
      >
        <LinearGradient
          colors={member.hasNewMoment ? gradients.aura : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          {member.avatarUri ? (
            <Image source={{ uri: member.avatarUri }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{member.displayName[0]}</Text>
            </View>
          )}
        </LinearGradient>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.displayName}</Text>
          {member.username ? <Text style={styles.memberUsername}>@{member.username}</Text> : null}
        </View>
        {member.hasNewMoment && <View style={styles.newDot} />}
        <SpringPressable
          style={styles.messageBtn}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/messages/${member.id}`);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Message ${member.displayName}`}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.auraLavender} />
        </SpringPressable>
      </SpringPressable>
    </Animated.View>
  );
}

function RequestRow({
  request,
  onAccept,
  onDecline,
}: {
  request: ConnectionRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={styles.requestRow}>
      <View style={styles.requestAvatarFallback}>
        <Text style={styles.avatarInitial}>{request.displayName?.[0] ?? '?'}</Text>
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.memberName}>{request.displayName ?? 'Someone'}</Text>
        <Text style={styles.memberUsername}>wants to join your circle</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          onPress={onAccept}
          style={styles.acceptBtn}
          accessibilityRole="button"
          accessibilityLabel="Accept"
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDecline}
          style={styles.declineBtn}
          accessibilityRole="button"
          accessibilityLabel="Decline"
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CircleScreen() {
  const router = useRouter();
  const api = useApi();
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [mems, reqs] = await Promise.all([
      api.listCircleMembers(),
      api.getConnectionRequests(),
    ]);
    setMembers(mems);
    setRequests(reqs);
  }, [api]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleAccept(requestId: string) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await api.acceptConnectionRequest(requestId);
    setRequests((prev) => prev.filter((r) => r.userId !== requestId));
    await load();
  }

  async function handleDecline(requestId: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await api.declineConnectionRequest(requestId);
    setRequests((prev) => prev.filter((r) => r.userId !== requestId));
  }

  if (loading) {
    return (
      <ScreenShell edges={['top']}>
        <Text style={styles.title}>Circle</Text>
        <View style={{ padding: spacing.lg, gap: spacing.sm }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={64} borderRadius={16} />)}
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
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Circle</Text>
            <Text style={styles.subtitle}>{members.length} people</Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/search');
            }}
            style={styles.findBtn}
            accessibilityRole="button"
            accessibilityLabel="Find people"
          >
            <Text style={styles.findBtnText}>+ Find People</Text>
          </TouchableOpacity>
        </View>

        {requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requests</Text>
            {requests.map((r) => (
              <RequestRow
                key={r.userId}
                request={r}
                onAccept={() => handleAccept(r.userId)}
                onDecline={() => handleDecline(r.userId)}
              />
            ))}
          </View>
        )}

        {members.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="Your Circle Is Empty"
            body="Find people you know and add them to your circle."
            actionLabel="Find People"
            onAction={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/search');
            }}
          />
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your People</Text>
            {members.map((m, i) => <MemberRow key={m.id} member={m} index={i} />)}
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.display,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    marginTop: 2,
  },
  findBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.auraPurple,
    minHeight: 44,
    justifyContent: 'center',
  },
  findBtnText: {
    color: colors.auraPurple,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.section,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    minHeight: 56,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(20,24,44,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(181,124,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.22)',
  },
  avatarInitial: { color: colors.auraPurple, fontSize: fontSize.body, fontFamily: fontFamily.serif },
  memberInfo: { flex: 1 },
  memberName: { color: colors.textPrimary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.body },
  memberUsername: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro, marginTop: 1 },
  newDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.auraPurple },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(181,124,255,0.06)',
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.18)',
    minHeight: 60,
  },
  requestAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(181,124,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestInfo: { flex: 1 },
  requestActions: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  acceptBtn: {
    backgroundColor: colors.auraPurple,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 34,
    justifyContent: 'center',
  },
  acceptText: { color: '#fff', fontFamily: fontFamily.sansMedium, fontSize: fontSize.caption },
  declineBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  declineText: { color: colors.textMuted, fontSize: 14 },
  tabBarSpacer: { height: 120 },
});
