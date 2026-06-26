import { useState, useEffect, useCallback } from 'react';
import type { RankedFeedItem } from '@momeants/types';
import type { EngineContext } from '../engines/types';
import { buildHomeFeed } from '../engines/feedEngine';
import { DEMO_RELATIONSHIP_WEIGHTS } from '../demo/relationships';
import { useApi } from '../context/ApiContext';

export function useFeedEngine() {
  const api = useApi();
  const [feed, setFeed] = useState<RankedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seenIds] = useState(() => new Set<string>());
  const [dismissedSparkIds] = useState(() => new Set<string>());

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

    // Gather all available spark templates from the spark library via a dummy delivery
    // We pull them from the spark history's template data, or fall back to spark settings context
    const availableSparks = sparkHistory
      .filter((d) => d.spark)
      .map((d) => d.spark)
      .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);

    // If no spark history, the engine will still work — it just won't insert sparks
    // In production this would be fetched from the backend

    const allMoments = [
      homeMoments.hero,
      ...homeMoments.recent,
      ...(homeMoments.resurfaced ? [homeMoments.resurfaced] : []),
    ].filter(Boolean);

    const context: EngineContext = {
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
    };

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

  return { feed, loading, refreshing, refresh, markSeen, dismissSpark };
}
