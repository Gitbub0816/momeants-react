import React, { useEffect, useState, useRef, useCallback } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Moment, SparkDelivery } from '@momeants/types';
import { HomeScreenSkeleton } from '../../src/components/core/SkeletonLoader';
import { EmptyState } from '../../src/components/core/EmptyState';
import { MomentFeedItem, FEED_ITEM_HEIGHT } from '../../src/components/memory/MomentFeedItem';
import { SparkCard } from '../../src/components/spark/SparkCard';
import { useApi } from '../../src/context/ApiContext';
import { colors, gradients, fontFamily, fontSize, spacing } from '@momeants/design';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W } = Dimensions.get('window');

type FeedItem =
  | { type: 'moment'; key: string; data: Moment }
  | { type: 'spark'; key: string; data: SparkDelivery };

export default function HomeScreen() {
  const api = useApi();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const viewabilityConfig = useRef({ itemVisibilityPercentThreshold: 55 });

  async function load() {
    const [home, todaySpark] = await Promise.all([
      api.listHomeMoments(),
      api.getTodaySpark(),
    ]);

    const momentItems: FeedItem[] = [
      ...(home.hero ? [{ type: 'moment' as const, key: home.hero.id, data: home.hero }] : []),
      ...(home.resurfaced ? [{ type: 'moment' as const, key: `resurfaced-${home.resurfaced.id}`, data: home.resurfaced }] : []),
      ...home.recent.map((m) => ({ type: 'moment' as const, key: `recent-${m.id}`, data: m })),
    ];

    const items: FeedItem[] = [];
    if (todaySpark && todaySpark.status !== 'dismissed' && todaySpark.status !== 'completed') {
      items.push({ type: 'spark', key: `spark-${todaySpark.id}`, data: todaySpark });
    }
    items.push(...momentItems);
    setFeedItems(items);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      if (item.type === 'spark') {
        return (
          <View style={styles.sparkSlide}>
            <LinearGradient colors={gradients.background} style={StyleSheet.absoluteFill} />
            <SparkCard
              delivery={item.data}
              onAccept={(id) => api.acceptSpark(id)}
              onDismiss={(id) => {
                api.dismissSpark(id);
                setFeedItems((prev) => prev.filter((_, i) => i !== index));
              }}
            />
          </View>
        );
      }
      return <MomentFeedItem moment={item.data} isActive={index === activeIndex} />;
    },
    [activeIndex]
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

  if (feedItems.length === 0) {
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
        data={feedItems}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
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
  notifBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
});
