import type { Moment, MomentPerson, MomentReaction, RankedFeedItem, FeedEngagementPrompt } from '@momeants/types';
import type { EngineContext } from './types';
import { computeClosenessScore } from './relationshipEngine';
import { scoreResurfacing, selectResurfacedMemory } from './resurfacingEngine';
import { rankImportantDays, buildImportantDayCard, scoreImportantDay } from './importantDaysEngine';
import {
  scoreSpark,
  buildSparkFeedCard,
  selectBackgroundSpark,
  selectMinigame,
  checkSparkFatigueRules,
} from './sparksEngine';

// --- Per-moment scoring components ---

function freshnessScore(moment: Moment, now: Date): number {
  const hoursAgo = (now.getTime() - new Date(moment.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursAgo <= 6) return 1.0;
  if (hoursAgo <= 24) return 0.85;
  if (hoursAgo <= 72) return 0.65;
  if (hoursAgo <= 168) return 0.40;
  if (hoursAgo <= 720) return 0.20;
  return 0.05;
}

function memoryImportanceScore(moment: Moment): number {
  let score = 0.2;
  if (moment.people.length > 0) score += 0.25;
  if (moment.location) score += 0.15;
  if (moment.moods.length > 0) score += 0.10;
  if (moment.caption && moment.caption.length > 10) score += 0.10;
  const totalReactions = moment.reactions.reduce((s: number, r: MomentReaction) => s + r.count, 0);
  if (totalReactions > 0) score += Math.min(0.10, totalReactions * 0.02);
  if (moment.comments.length > 0) score += Math.min(0.10, moment.comments.length * 0.03);
  return Math.min(1, score);
}

function conversationPotentialScore(moment: Moment): number {
  // Caption + tagged people with emotional moods = conversation potential
  let score = 0.2;
  if (moment.caption) score += 0.25;
  if (moment.people.length > 0) score += 0.25;
  if (moment.moods.includes('Nostalgic') || moment.moods.includes('Grateful') || moment.moods.includes('Loved')) {
    score += 0.30;
  }
  return Math.min(1, score);
}

function importantDayScoreForMoment(moment: Moment, context: EngineContext): number {
  const related = context.calendarEvents.filter((e: { personId?: string }) =>
    moment.people.some((p: MomentPerson) => e.personId === p.id)
  );
  if (related.length === 0) return 0;
  return Math.max(...related.map((e) => scoreImportantDay(e, context)));
}

function sparkRelevanceScoreForMoment(moment: Moment, context: EngineContext): number {
  if (context.availableSparks.length === 0) return 0;
  // Moments with people tagged + location are good spark seeds
  if (moment.people.length > 0 && moment.location) return 0.9;
  if (moment.people.length > 0) return 0.65;
  return 0.3;
}

function fatiguePenaltyForMoment(moment: Moment, context: EngineContext): number {
  return context.seenFeedItemIds.has(moment.id) ? 0.25 : 0;
}

function privacyPenaltyForMoment(moment: Moment): number {
  // Private moments appear less in feed (they're for personal archive)
  return moment.visibility === 'private' ? 0.20 : 0;
}

function repetitionPenalty(moment: Moment, rankedSoFar: RankedFeedItem[]): number {
  // Penalize if we already have 2 items from this author
  const authorCount = rankedSoFar.filter(
    (item) => item.moment?.authorId === moment.authorId
  ).length;
  if (authorCount >= 2) return 0.35;
  if (authorCount >= 1) return 0.10;
  return 0;
}

export function scoreMomentForFeed(
  moment: Moment,
  context: EngineContext,
  rankedSoFar: RankedFeedItem[] = []
): number {
  const relationshipScore = moment.people.length > 0
    ? Math.max(...moment.people.map((p: MomentPerson) => computeClosenessScore(p.id, context)))
    : computeClosenessScore(moment.authorId, context);

  const engagementPotential = conversationPotentialScore(moment);
  const memoryImportance = memoryImportanceScore(moment);
  const freshness = freshnessScore(moment, context.currentTime);
  const convPotential = conversationPotentialScore(moment);
  const importantDay = importantDayScoreForMoment(moment, context);
  const sparkRelevance = sparkRelevanceScoreForMoment(moment, context);
  const fatigue = fatiguePenaltyForMoment(moment, context);
  const privacy = privacyPenaltyForMoment(moment);
  const repetition = repetitionPenalty(moment, rankedSoFar);

  return Math.max(
    0,
    relationshipScore * 0.26 +
    engagementPotential * 0.20 +
    memoryImportance * 0.18 +
    freshness * 0.12 +
    convPotential * 0.10 +
    importantDay * 0.08 +
    sparkRelevance * 0.06 -
    fatigue - privacy - repetition
  );
}

// --- Privacy and fatigue filters ---

export function applyPrivacyFilters(
  candidates: Moment[],
  context: EngineContext
): Moment[] {
  return candidates.filter((m) => {
    if (m.authorId === context.userId) return true;
    if (m.visibility === 'private') return false;
    // close_circle moments only visible if there's a relationship
    if (m.visibility === 'close_circle') {
      const score = computeClosenessScore(m.authorId, context);
      return score > 0.3;
    }
    return true;
  });
}

export function applyFatigueRules(ranked: RankedFeedItem[]): RankedFeedItem[] {
  const result: RankedFeedItem[] = [];
  const authorConsecutive = new Map<string, number>();

  for (const item of ranked) {
    const authorId = item.moment?.authorId ?? 'system';
    const count = authorConsecutive.get(authorId) ?? 0;

    // Max 2 in a row from same person
    if (count >= 2) {
      // Insert elsewhere later — skip for now and re-add at lower priority
      continue;
    }

    result.push(item);
    authorConsecutive.set(authorId, count + 1);

    // Reset counter if next item breaks streak (update on every push)
    if (result.length >= 2) {
      const prev = result[result.length - 2];
      const prevAuthor = prev.moment?.authorId ?? 'system';
      if (prevAuthor !== authorId) {
        authorConsecutive.set(prevAuthor, 0);
      }
    }
  }

  return result;
}

// --- Engagement prompts ---

export function buildEngagementPrompts(
  moment: Moment,
  context: EngineContext
): FeedEngagementPrompt[] {
  const prompts: FeedEngagementPrompt[] = [];

  if (moment.people.length > 0) {
    const closest = moment.people.reduce((best: MomentPerson, p: MomentPerson) => {
      return computeClosenessScore(p.id, context) > computeClosenessScore(best.id, context)
        ? p : best;
    });
    prompts.push({
      type: 'message',
      label: `Message ${closest.name}`,
      icon: '💬',
      targetId: closest.id,
    });
  }

  if (moment.moods.includes('Nostalgic') || moment.moods.includes('Grateful')) {
    prompts.push({ type: 'react', label: 'React with love', icon: '❤️' });
  } else {
    prompts.push({ type: 'react', label: 'React', icon: '✨' });
  }

  if (moment.people.length > 0) {
    prompts.push({ type: 'spark', label: 'Start a Spark', icon: '⚡' });
  }

  prompts.push({ type: 'comment', label: 'Add a thought', icon: '💭' });

  return prompts.slice(0, 3);
}

// --- Spark card insertion ---

export function insertSparkCards(
  feed: RankedFeedItem[],
  context: EngineContext
): RankedFeedItem[] {
  const fatigueRules = checkSparkFatigueRules(context);
  const result = [...feed];

  // Count sparks already in first 10
  const sparksInFirst10 = result.slice(0, 10).filter(
    (item) => item.type === 'spark_card' || item.type === 'minigame_spark'
  ).length;

  if (sparksInFirst10 >= 2) return result;

  // Insert minigame spark at position 3 if allowed
  if (fatigueRules.allowProminentHomeSpark) {
    const minigame = selectMinigame(context);
    if (minigame) {
      const card = buildSparkFeedCard(minigame, context);
      result.splice(Math.min(3, result.length), 0, card);
    }
  }

  // Insert background spark around position 7
  if (fatigueRules.backgroundSparksRemainingToday > 0) {
    const bgSpark = selectBackgroundSpark(context);
    if (bgSpark) {
      const card = buildSparkFeedCard(bgSpark, context);
      result.splice(Math.min(7, result.length), 0, card);
    }
  }

  return result;
}

// --- Important day card insertion ---

export function insertImportantDayCards(
  feed: RankedFeedItem[],
  context: EngineContext
): RankedFeedItem[] {
  const topDays = rankImportantDays(context.calendarEvents, context).slice(0, 2);
  if (topDays.length === 0) return feed;

  const result = [...feed];

  // Insert the most important day card at position 1 (after hero)
  const topCard = buildImportantDayCard(topDays[0], context);
  if (topCard.priority === 'critical' || topCard.priority === 'high') {
    result.splice(1, 0, topCard);
  }

  // Insert second at position 5 if exists
  if (topDays[1]) {
    const secondCard = buildImportantDayCard(topDays[1], context);
    result.splice(Math.min(5, result.length), 0, secondCard);
  }

  return result;
}

// --- Rank feed candidates ---

export function rankFeedCandidates(
  candidates: Moment[],
  context: EngineContext
): RankedFeedItem[] {
  const filtered = applyPrivacyFilters(candidates, context);

  const scored: RankedFeedItem[] = [];
  for (const moment of filtered) {
    const score = scoreMomentForFeed(moment, context, scored);
    const isResurfaced = scoreResurfacing(moment, context) > 0.3;

    scored.push({
      key: `moment_${moment.id}`,
      type: isResurfaced ? 'resurfaced_memory' : 'moment',
      priority: score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low',
      score,
      moment,
      resurfaceLabel: isResurfaced ? `A memory from ${new Date(moment.createdAt).getFullYear()}` : undefined,
      engagementPrompts: buildEngagementPrompts(moment, context),
    });
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Guarantee at least one close-person item near the top
  const closePersonIdx = scored.findIndex(
    (item) =>
      item.moment &&
      item.moment.people.some((p: MomentPerson) => computeClosenessScore(p.id, context) > 0.6)
  );
  if (closePersonIdx > 2 && closePersonIdx !== -1) {
    const [item] = scored.splice(closePersonIdx, 1);
    scored.splice(1, 0, item);
  }

  return applyFatigueRules(scored);
}

// --- Main entry point ---

export function buildHomeFeed(context: EngineContext): RankedFeedItem[] {
  // Also include resurfaced memory as a special card
  const resurfaced = selectResurfacedMemory(context);
  const baseCandidates = resurfaced
    ? context.moments.filter((m) => m.id !== resurfaced.id)
    : context.moments;

  let feed = rankFeedCandidates(baseCandidates, context);

  // Prepend resurfaced memory if high quality
  if (resurfaced) {
    const resurfaceScore = scoreResurfacing(resurfaced, context);
    if (resurfaceScore > 0.45) {
      feed.unshift({
        key: `resurfaced_${resurfaced.id}`,
        type: 'resurfaced_memory',
        priority: 'high',
        score: resurfaceScore,
        moment: resurfaced,
        resurfaceLabel: `A memory from ${new Date(resurfaced.createdAt).getFullYear()}`,
        engagementPrompts: buildEngagementPrompts(resurfaced, context),
      });
    }
  }

  feed = insertImportantDayCards(feed, context);
  feed = insertSparkCards(feed, context);

  return feed;
}
