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

  return { feed, loading, refreshing, refresh, markSeen, dismissSpark, markSponsoredSeen };
}
