import { useState, useEffect, useCallback } from 'react';
import type { RankedFeedItem } from '@momeants/types';
import type { EngineContext } from '../engines/types';
import { buildHomeFeed } from '../engines/feedEngine';
import { inferCliques } from '../engines/relationshipEngine';
import { useApi } from '../context/ApiContext';
import type { SocialGraph } from '../engines/types';

export function useFeedEngine() {
  const api = useApi();
  const [feed, setFeed] = useState<RankedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [timelineCursor, setTimelineCursor] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [hasMore, setHasMore] = useState(true);
  const [seenIds] = useState(() => new Set<string>());
  const [dismissedSparkIds] = useState(() => new Set<string>());
  const [seenSponsoredIds] = useState(() => new Map<string, number>());

  const buildFeed = useCallback(async () => {
    const fallbackHome = { hero: null as any, recent: [], resurfaced: undefined };
    const [
      homeMoments,
      circleMembers,
      circleMoments,
      conversations,
      sparkHistory,
      calendarEvents,
    ] = await Promise.all([
      api.listHomeMoments().catch(() => fallbackHome),
      api.listCircleMembers().catch(() => []),
      api.listCircleMoments().catch(() => []),
      api.listConversations().catch(() => []),
      api.getSparkHistory(30).catch(() => []),
      api.listCalendarEvents().catch(() => []),
    ]);

    const availableSparks = sparkHistory
      .filter((d) => d.spark)
      .map((d) => d.spark)
      .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);

    const allMoments = [
      homeMoments.hero,
      ...homeMoments.recent,
      ...(homeMoments.resurfaced ? [homeMoments.resurfaced] : []),
    ].filter(Boolean);

    const emptySocialGraph: SocialGraph = new Map();

    const baseContext: EngineContext = {
      userId: 'me',
      currentTime: new Date(),
      moments: allMoments,
      circleMembers,
      cliques: [],
      circleMoments,
      conversations,
      sparkHistory,
      availableSparks,
      calendarEvents: calendarEvents ?? [],
      seenFeedItemIds: seenIds,
      dismissedSparkIds,
      relationshipWeights: [],
      socialGraph: emptySocialGraph,
      sponsoredItems: [],
      discoveryMoments: [],
      userInterestSignals: [],
      seenSponsoredIds,
    };
    const inferredCliques = inferCliques(baseContext);

    const context: EngineContext = { ...baseContext, cliques: inferredCliques };

    const ranked = buildHomeFeed(context);
    setFeed(ranked);
  }, [api]);

  useEffect(() => {
    buildFeed().finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await buildFeed();
    setRefreshing(false);
  }, [buildFeed]);

  const markSeen = useCallback((itemId: string) => {
    seenIds.add(itemId);
  }, [seenIds]);

  const dismissSpark = useCallback((sparkId: string) => {
    dismissedSparkIds.add(sparkId);
  }, [dismissedSparkIds]);

  const markSponsoredSeen = useCallback((adId: string) => {
    seenSponsoredIds.set(adId, (seenSponsoredIds.get(adId) ?? 0) + 1);
  }, [seenSponsoredIds]);

  // Load older moments by going back one month at a time
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const prevMonth = timelineCursor.month === 1
        ? { year: timelineCursor.year - 1, month: 12 }
        : { year: timelineCursor.year, month: timelineCursor.month - 1 };

      const older = await api.listTimeline({ year: prevMonth.year, month: prevMonth.month }).catch(() => []);
      if (older.length === 0) {
        setHasMore(false);
      } else {
        const olderMoments = older.flatMap((g) => g.moments);
        const olderItems: RankedFeedItem[] = olderMoments.map((m) => ({
          key: m.id,
          type: 'moment' as const,
          priority: 'low' as const,
          score: 0,
          moment: m,
        }));
        setFeed((prev) => [...prev, ...olderItems]);
        setTimelineCursor(prevMonth);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, timelineCursor, api]);

  return { feed, loading, refreshing, refresh, markSeen, dismissSpark, markSponsoredSeen, loadMore, loadingMore, hasMore };
}
