import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ViewToken,
  ViewabilityConfig,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { RankedFeedItem } from '@momeants/types';
import { HomeScreenSkeleton } from '../../src/components/core/SkeletonLoader';
import { EmptyState } from '../../src/components/core/EmptyState';
import { MomentFeedItem, FEED_ITEM_HEIGHT } from '../../src/components/memory/MomentFeedItem';
import { SparkCard } from '../../src/components/spark/SparkCard';
import { useFeedEngine } from '../../src/hooks/useFeedEngine';
import { useApi } from '../../src/context/ApiContext';
import { colors, gradients, fontFamily, fontSize, spacing, radii } from '@momeants/design';

const { width: W } = Dimensions.get('window');
const TAB_CLEARANCE = 114;

// ── Important Day slide ────────────────────────────────────────────────────
function ImportantDaySlide({ item }: { item: RankedFeedItem }) {
  const event = item.calendarEvent;
  const accent = item.accentColor ?? colors.auraPurple;

  return (
    <View style={[styles.importantDaySlide, { height: FEED_ITEM_HEIGHT }]}>
      <LinearGradient
        colors={['#0A0D1E', '#12183A']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.importantDayCard, { borderColor: accent + '50' }]}>
        <Text style={styles.importantDayEmoji}>{event?.emoji ?? '📅'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.importantDayTitle, { color: accent }]}>{item.headline}</Text>
          {item.subtext ? (
            <Text style={styles.importantDaySubtext}>{item.subtext}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ── Engagement prompt card slide ───────────────────────────────────────────
function EngagementPromptSlide({ item }: { item: RankedFeedItem }) {
  const router = useRouter();
  const accent = item.accentColor ?? colors.auraBlue;

  return (
    <View style={[styles.importantDaySlide, { height: FEED_ITEM_HEIGHT }]}>
      <LinearGradient
        colors={['#080C1A', '#111827']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.importantDayCard, { borderColor: accent + '40' }]}>
        <Text style={styles.importantDayEmoji}>💬</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.importantDayTitle, { color: accent }]}>{item.headline ?? 'Someone you care about'}</Text>
          {item.subtext ? (
            <Text style={styles.importantDaySubtext}>{item.subtext}</Text>
          ) : null}
          {item.engagementPrompts && item.engagementPrompts.length > 0 && (
            <View style={styles.promptRow}>
              {item.engagementPrompts.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.promptChip, { borderColor: accent + '60' }]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (p.type === 'message' && p.targetId) {
                      router.push(`/messages/${p.targetId}`);
                    }
                  }}
                >
                  <Text style={styles.promptChipText}>{p.icon} {p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Discovery moment slide ────────────────────────────────────────────────
function DiscoverySlide({ item, isActive }: { item: RankedFeedItem; isActive: boolean }) {
  return (
    <View style={{ width: W, height: FEED_ITEM_HEIGHT }}>
      <MomentFeedItem
        moment={item.moment!}
        isActive={isActive}
        engagementPrompts={item.engagementPrompts}
      />
      {item.discoveryContext ? (
        <View style={styles.discoveryBadge} pointerEvents="none">
          <Text style={styles.discoveryBadgeText}>✦ {item.discoveryContext}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Sponsored content slide ───────────────────────────────────────────────
function SponsoredSlide({ item, onPress }: { item: RankedFeedItem; onPress: () => void }) {
  const ad = item.sponsored;
  if (!ad) return null;

  return (
    <View style={[styles.importantDaySlide, { height: FEED_ITEM_HEIGHT }]}>
      <LinearGradient colors={['#0C0D14', '#16182A']} style={StyleSheet.absoluteFill} />
      {ad.imageUri ? (
        <Image
          source={{ uri: ad.imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : null}
      {/* Overlay gradient so text is readable over image */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.92)']}
        style={[StyleSheet.absoluteFill, { top: '40%' }]}
      />
      <View style={styles.sponsoredContent}>
        <View style={styles.sponsoredTag}>
          <Text style={styles.sponsoredTagText}>Sponsored</Text>
        </View>
        <Text style={styles.sponsoredHeadline}>{ad.headline}</Text>
        {ad.subtext ? (
          <Text style={styles.sponsoredSubtext}>{ad.subtext}</Text>
        ) : null}
        <TouchableOpacity style={styles.sponsoredCta} onPress={onPress}>
          <Text style={styles.sponsoredCtaText}>{ad.ctaLabel}</Text>
        </TouchableOpacity>
        <Text style={styles.sponsoredBrand}>{ad.advertiserName}</Text>
      </View>
    </View>
  );
}

// ── Main home screen ───────────────────────────────────────────────────────
export default function HomeScreen() {
  const api = useApi();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { feed, loading, refreshing, refresh, markSeen, dismissSpark, markSponsoredSeen, loadMore } = useFeedEngine();
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef<ViewabilityConfig>({ itemVisiblePercentThreshold: 55 });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const idx = viewableItems[0].index;
        setActiveIndex(idx);
        const item = feed[idx];
        if (item?.moment) markSeen(item.moment.id);
      }
    },
    [feed, markSeen]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: RankedFeedItem; index: number }) => {
      // Moment-based full-screen slides
      if (item.moment && (
        item.type === 'moment' ||
        item.type === 'resurfaced_memory' ||
        item.type === 'circle_moment' ||
        item.type === 'bestie_update' ||
        item.type === 'trip_memory'
      )) {
        return (
          <MomentFeedItem
            moment={item.moment}
            isActive={index === activeIndex}
            resurfaceLabel={item.resurfaceLabel}
            engagementPrompts={item.engagementPrompts}
          />
        );
      }

      // Spark slides — minigame full screen
      if (item.spark && item.type === 'minigame_spark') {
        const syntheticDelivery = {
          id: `engine-${item.spark.id}`,
          sparkId: item.spark.id,
          spark: item.spark,
          userId: 'me',
          status: 'pending' as const,
          deliveredAt: new Date().toISOString(),
          recommendationReason: item.subtext,
        };
        return (
          <View style={styles.sparkSlide}>
            <LinearGradient colors={gradients.background} style={StyleSheet.absoluteFill} />
            <SparkCard
              delivery={syntheticDelivery}
              onAccept={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/sparks');
              }}
              onDismiss={() => dismissSpark(item.spark!.id)}
            />
          </View>
        );
      }

      // Background engagement spark (smaller card in feed)
      if (item.spark && item.type === 'spark_card') {
        const syntheticDelivery = {
          id: `engine-bg-${item.spark.id}`,
          sparkId: item.spark.id,
          spark: item.spark,
          userId: 'me',
          status: 'pending' as const,
          deliveredAt: new Date().toISOString(),
          recommendationReason: item.subtext,
        };
        return (
          <View style={styles.sparkSlide}>
            <LinearGradient colors={gradients.background} style={StyleSheet.absoluteFill} />
            <SparkCard
              delivery={syntheticDelivery}
              onAccept={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/sparks');
              }}
              onDismiss={() => dismissSpark(item.spark!.id)}
            />
          </View>
        );
      }

      // Important day cards
      if (
        item.type === 'important_day' ||
        item.type === 'birthday_reminder' ||
        item.type === 'anniversary' ||
        item.type === 'memory_anniversary'
      ) {
        return <ImportantDaySlide item={item} />;
      }

      // Engagement prompts (conversation starters, gratitude nudges)
      if (
        item.type === 'engagement_prompt' ||
        item.type === 'conversation_starter' ||
        item.type === 'gratitude_nudge'
      ) {
        return <EngagementPromptSlide item={item} />;
      }

      // Discovery moment — personal content from friends-of-friends
      if (item.type === 'discovery_moment' && item.moment) {
        return <DiscoverySlide item={item} isActive={index === activeIndex} />;
      }

      // Sponsored content
      if (item.type === 'sponsored' && item.sponsored) {
        return (
          <SponsoredSlide
            item={item}
            onPress={() => {
              markSponsoredSeen(item.sponsored!.id);
              Linking.openURL(item.sponsored!.ctaUrl).catch(() => null);
            }}
          />
        );
      }

      // Fallback for clique_update etc — render as moment if we have one
      if (item.moment) {
        return (
          <MomentFeedItem
            moment={item.moment}
            isActive={index === activeIndex}
            resurfaceLabel={item.resurfaceLabel}
          />
        );
      }

      return null;
    },
    [activeIndex, dismissSpark, markSponsoredSeen]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: FEED_ITEM_HEIGHT,
      offset: FEED_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  if (loading) {
    return (
      <View style={styles.fill}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <HomeScreenSkeleton />
      </View>
    );
  }

  if (feed.length === 0) {
    return (
      <View style={styles.fill}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.wordmark}>momeants</Text>
        </View>
        <EmptyState
          icon="📷"
          title="No moments yet"
          body="Capture your first moment — a photo, a feeling, a place."
          actionLabel="Capture a moment"
          onAction={() => router.push('/capture')}
        />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fixed overlay header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Text style={styles.wordmark}>momeants</Text>
        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          style={styles.notifBtn}
          accessibilityLabel="Notifications"
        >
          <Text style={styles.notifIcon}>◎</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={feed}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={FEED_ITEM_HEIGHT}
        snapToAlignment="start"
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        style={styles.fill}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.auraPurple}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.ink900 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  wordmark: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.title,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  notifBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  notifIcon: {
    color: colors.textPrimary,
    fontSize: 22,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  sparkSlide: {
    width: W,
    height: FEED_ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  importantDaySlide: {
    width: W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  importantDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.xl,
    width: '100%',
  },
  importantDayEmoji: { fontSize: 40 },
  importantDayTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.title,
    marginBottom: spacing.xs,
  },
  importantDaySubtext: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    lineHeight: 20,
  },
  promptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  promptChipText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
  // Discovery badge
  discoveryBadge: {
    position: 'absolute',
    top: 56,
    left: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  discoveryBadgeText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    letterSpacing: 0.5,
  },
  // Sponsored slide
  sponsoredContent: {
    position: 'absolute',
    bottom: 80,
    left: spacing.lg,
    right: spacing.lg,
  },
  sponsoredTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,210,138,0.18)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,210,138,0.35)',
  },
  sponsoredTagText: {
    color: '#FFD28A',
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.micro,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sponsoredHeadline: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.section,
    marginBottom: spacing.xs,
  },
  sponsoredSubtext: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  sponsoredCta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.textPrimary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  sponsoredCtaText: {
    color: colors.ink900,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
  sponsoredBrand: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.micro,
    letterSpacing: 0.3,
  },
});
