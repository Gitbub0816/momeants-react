import type { SponsoredItem, SponsorCategory } from '@momeants/types';
import type { RankedFeedItem } from '@momeants/types';
import type { EngineContext } from './types';

// ── Ad relevance scoring ─────────────────────────────────────────────────────

// Maps mood tags and caption keywords → interest signals
const INTEREST_SIGNALS: Record<string, string[]> = {
  travel: ['Adventurous', 'Free', 'trip', 'vacation', 'travel', 'explore', 'wanderlust'],
  food: ['Cozy', 'dinner', 'food', 'restaurant', 'coffee', 'breakfast', 'lunch', 'eating'],
  family: ['Loved', 'Grateful', 'family', 'kids', 'home', 'mom', 'dad', 'together'],
  wellness: ['Peaceful', 'mindful', 'yoga', 'hike', 'nature', 'calm', 'breathe'],
  gifting: ['birthday', 'anniversary', 'gift', 'celebrate', 'special'],
  photography: ['camera', 'golden hour', 'photo', 'shot', 'lighting', 'portrait'],
};

function extractUserInterests(context: EngineContext): string[] {
  const signals = new Set<string>(context.userInterestSignals);

  // Infer from moments
  context.moments.forEach((m) => {
    m.moods.forEach((mood) => {
      Object.entries(INTEREST_SIGNALS).forEach(([interest, triggers]) => {
        if (triggers.includes(mood)) signals.add(interest);
      });
    });
    if (m.caption) {
      const cap = m.caption.toLowerCase();
      Object.entries(INTEREST_SIGNALS).forEach(([interest, triggers]) => {
        if (triggers.some((t) => cap.includes(t.toLowerCase()))) signals.add(interest);
      });
    }
  });

  return [...signals];
}

function scoreAd(ad: SponsoredItem, context: EngineContext): number {
  if (!ad.active) return 0;

  const impressionsToday = context.seenSponsoredIds.get(ad.id) ?? 0;
  if (impressionsToday >= ad.impressionCap) return 0;

  const userInterests = extractUserInterests(context);

  // Interest match
  const matchCount = ad.targetInterests.filter((i) => userInterests.includes(i)).length;
  const interestScore = matchCount > 0
    ? Math.min(1, matchCount / ad.targetInterests.length * 1.5)
    : 0.10; // floor: even non-targeted ads have some chance

  // Relationship type match (e.g. gifting ads for users with close family)
  let relationshipBoost = 0;
  if (ad.targetRelationshipTypes && ad.targetRelationshipTypes.length > 0) {
    const hasMatch = context.relationshipWeights.some((rw) =>
      ad.targetRelationshipTypes!.includes(rw.relationshipType)
    );
    if (hasMatch) relationshipBoost = 0.15;
  }

  // Frequency penalty: more impressions = lower score
  const frequencyPenalty = impressionsToday * 0.20;

  return Math.max(0, Math.min(1, interestScore + relationshipBoost - frequencyPenalty));
}

// ── Insertion rules ──────────────────────────────────────────────────────────

const MIN_ITEMS_BEFORE_FIRST_AD = 4;  // never in first 4 items
const AD_SPACING = 8;                  // at least 8 items between ads
const MAX_ADS_PER_SESSION = 3;         // cap for the session

function findInsertionPositions(feed: RankedFeedItem[]): number[] {
  const positions: number[] = [];
  let lastAdPosition = -AD_SPACING;

  for (let i = MIN_ITEMS_BEFORE_FIRST_AD; i < feed.length; i++) {
    if (
      i - lastAdPosition >= AD_SPACING &&
      feed[i].type !== 'sponsored' &&
      feed[i].type !== 'important_day' &&
      feed[i].type !== 'birthday_reminder'
    ) {
      positions.push(i);
      lastAdPosition = i;
      if (positions.length >= MAX_ADS_PER_SESSION) break;
    }
  }

  return positions;
}

// ── Main insertion function ──────────────────────────────────────────────────

export function insertSponsoredContent(
  feed: RankedFeedItem[],
  context: EngineContext
): RankedFeedItem[] {
  if (context.sponsoredItems.length === 0) return feed;

  // Score and rank ads
  const rankedAds = [...context.sponsoredItems]
    .map((ad) => ({ ad, score: scoreAd(ad, context) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (rankedAds.length === 0) return feed;

  const insertPositions = findInsertionPositions(feed);
  const result = [...feed];
  let offset = 0;

  for (let i = 0; i < Math.min(insertPositions.length, rankedAds.length); i++) {
    const { ad, score } = rankedAds[i];
    const position = insertPositions[i] + offset;

    const sponsoredItem: RankedFeedItem = {
      key: `sponsored_${ad.id}_${Date.now()}`,
      type: 'sponsored',
      priority: 'low',
      score,
      sponsored: ad,
      headline: ad.headline,
      subtext: ad.subtext,
      accentColor: '#FFD28A',
    };

    result.splice(position, 0, sponsoredItem);
    offset++;
  }

  return result;
}

export function rankAds(ads: SponsoredItem[], context: EngineContext): SponsoredItem[] {
  return [...ads]
    .map((ad) => ({ ad, score: scoreAd(ad, context) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ ad }) => ad);
}
