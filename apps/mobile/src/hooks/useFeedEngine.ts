import { useState, useEffect, useCallback } from 'react';
import type { RankedFeedItem } from '@momeants/types';
import type { EngineContext } from '../engines/types';
import { buildHomeFeed } from '../engines/feedEngine';
import { inferCliques } from '../engines/relationshipEngine';
import { DEMO_RELATIONSHIP_WEIGHTS } from '../demo/relationships';
import { MOCK_SPONSORED_ITEMS } from '../demo/sponsored';
import { useApi } from '../context/ApiContext';

// Mock discovery moments — second-degree users who aren't in direct circle.
// In production this comes from the backend feed candidates endpoint.
import { MOCK_DISCOVERY_MOMENTS, MOCK_SOCIAL_GRAPH } from '../demo/discovery';

export function useFeedEngine() {
  const api = useApi();
  const [feed, setFeed] = useState<RankedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seenIds] = useState(() => new Set<string>());
  const [dismissedSparkIds] = useState(() => new Set<string>());
  const [seenSponsoredIds] = useState(() => new Map<string, number>());

  const buildFeed = useCallback(async () => {
    const [
      homeMoments,
      circleMembers,
      circleMoments,
      conversations,
      sparkHistory,
      calendarEvents,
      sparkSettings,
    ] = await Promise.all([
      api.listHomeMoments(),
      api.listCircleMembers(),
      api.listCircleMoments(),
      api.listConversations(),
      api.getSparkHistory(30),
      api.listCalendarEvents(),
      api.getSparkSettings(),
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
      calendarEvents,
      seenFeedItemIds: seenIds,
      dismissedSparkIds,
      relationshipWeights: DEMO_RELATIONSHIP_WEIGHTS,
      socialGraph: MOCK_SOCIAL_GRAPH,
      sponsoredItems: MOCK_SPONSORED_ITEMS,
      discoveryMoments: MOCK_DISCOVERY_MOMENTS,
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
