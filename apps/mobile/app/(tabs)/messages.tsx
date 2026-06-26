import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenShell } from '../../src/components/core';
import { EmptyState } from '../../src/components/core/EmptyState';
import { Skeleton } from '../../src/components/core/SkeletonLoader';
import { useApi } from '../../src/context/ApiContext';
import type { Conversation } from '@momeants/types';
import { colors } from '@momeants/design';
import { spacing, radii } from '@momeants/design';
import { fontSize, fontFamily } from '@momeants/design';

function ConversationItem({ conv }: { conv: Conversation }) {
  const router = useRouter();
  const otherNames = conv.participantNames.filter((_, i) => conv.participantIds[i] !== 'me');
  const displayName = conv.cliqueName ?? otherNames.join(', ');
  const avatarUri = conv.participantAvatarUris?.find((u) => u);
  const time = conv.lastMessageAt
    ? new Date(conv.lastMessageAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/messages/${conv.id}`);
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${displayName}`}
    >
      <View style={styles.avatarWrap}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{displayName[0]}</Text>
          </View>
        )}
        {conv.unreadCount > 0 && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.itemBody}>
        <View style={styles.itemTop}>
          <Text style={[styles.itemName, conv.unreadCount > 0 && styles.itemNameBold]}>
            {displayName}
          </Text>
          <Text style={styles.itemTime}>{time}</Text>
        </View>
        <Text style={[styles.itemPreview, conv.unreadCount > 0 && styles.itemPreviewBold]} numberOfLines={1}>
          {conv.lastMessage?.text}
        </Text>
        {conv.cliqueName && (
          <Text style={styles.groupTag}>{conv.cliqueName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const api = useApi();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const convos = await api.listConversations();
    setConversations(convos);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  if (loading) {
    return (
      <ScreenShell edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={72} borderRadius={16} />
          ))}
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {totalUnread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{totalUnread}</Text>
          </View>
        )}
      </View>

      {conversations.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No messages yet"
          body="Share a moment or start a Spark with someone to begin a conversation."
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ConversationItem conv={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.auraPurple} />
          }
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.title },
  unreadBadge: {
    backgroundColor: colors.auraPurple,
    borderRadius: radii.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: { color: '#fff', fontSize: 11, fontFamily: fontFamily.sansMedium },
  list: { paddingVertical: spacing.sm, paddingBottom: 120 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    minHeight: 72,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(181,124,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.auraPurple, fontSize: fontSize.section, fontFamily: fontFamily.serif },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.auraPurple,
    borderWidth: 2,
    borderColor: colors.ink900,
  },
  itemBody: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  itemName: { color: colors.textSecondary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.body },
  itemNameBold: { color: colors.textPrimary },
  itemTime: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro },
  itemPreview: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption, lineHeight: 18 },
  itemPreviewBold: { color: colors.textSecondary },
  groupTag: { color: colors.auraPurple, fontFamily: fontFamily.sans, fontSize: fontSize.micro, marginTop: 2 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 52 + spacing.lg + spacing.md,
  },
});
