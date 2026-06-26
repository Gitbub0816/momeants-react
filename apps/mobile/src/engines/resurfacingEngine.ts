import type { Moment, MomentPerson } from '@momeants/types';
import type { EngineContext } from './types';
import { computeClosenessScore } from './relationshipEngine';

function daysSince(isoDate: string, now: Date): number {
  return (now.getTime() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}

function dateRelevanceScore(moment: Moment, now: Date): number {
  const created = new Date(moment.createdAt);
  const dayOfYear = (d: Date) => {
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };
  const thisDay = dayOfYear(now);
  const momentDay = dayOfYear(created);
  const diff = Math.abs(thisDay - momentDay);
  const yearDiff = Math.floor(daysSince(moment.createdAt, now) / 365);

  // Perfect anniversary (same day, 1+ year ago)
  if (diff <= 2 && yearDiff >= 1) return 1.0;
  // Close to anniversary
  if (diff <= 7 && yearDiff >= 1) return 0.80;
  if (diff <= 14 && yearDiff >= 1) return 0.55;
  // Same month from past year
  if (created.getMonth() === now.getMonth() && yearDiff >= 1) return 0.35;
  return 0.10;
}

function memoryScore(moment: Moment): number {
  let score = 0.3;
  if (moment.people.length > 0) score += 0.15 * Math.min(1, moment.people.length / 3);
  if (moment.location) score += 0.15;
  if (moment.moods.length > 0) score += 0.10;
  if (moment.caption && moment.caption.length > 20) score += 0.10;
  if (moment.reactions.length > 0) score += 0.10 * Math.min(1, moment.reactions.reduce((s: number, r: { count: number }) => s + r.count, 0) / 5);
  if (moment.comments.length > 0) score += 0.10 * Math.min(1, moment.comments.length / 3);
  return Math.min(1, score);
}

function relationshipScoreForMoment(moment: Moment, context: EngineContext): number {
  if (moment.people.length === 0) return 0.2;
  const scores = moment.people.map((p: MomentPerson) => computeClosenessScore(p.id, context));
  return Math.max(...scores);
}

function engagementPotentialScore(moment: Moment): number {
  // Moments with people tagged, captions, or moods invite more engagement
  let score = 0.3;
  if (moment.people.length > 0) score += 0.3;
  if (moment.caption) score += 0.2;
  if (moment.moods.length > 1) score += 0.2;
  return Math.min(1, score);
}

function sparkPotentialScore(moment: Moment): number {
  if (moment.people.length > 0 && moment.location) return 0.9;
  if (moment.people.length > 0) return 0.7;
  if (moment.location) return 0.5;
  return 0.3;
}

function importantDayPotentialScore(moment: Moment, context: EngineContext): number {
  const created = new Date(moment.createdAt);
  const relevant = context.calendarEvents.filter((e: { date: string; personId?: string }) => {
    const eventDate = new Date(e.date + 'T00:00:00');
    return (
      Math.abs(eventDate.getMonth() - created.getMonth()) <= 1 &&
      moment.people.some((p: MomentPerson) => e.personId === p.id)
    );
  });
  return relevant.length > 0 ? 0.8 : 0.2;
}

function noveltyScore(moment: Moment, context: EngineContext): number {
  const recentlySeen = context.seenFeedItemIds.has(moment.id);
  return recentlySeen ? 0.1 : 0.9;
}

function sensitivityPenalty(moment: Moment): number {
  // Private moments have slight penalty (they should be rare resurfacing)
  return moment.visibility === 'private' ? 0.15 : 0;
}

function fatiguePenalty(moment: Moment, context: EngineContext): number {
  // If this has been resurfaced recently (in seenFeedItemIds), penalize
  return context.seenFeedItemIds.has(moment.id) ? 0.30 : 0;
}

export function scoreResurfacing(moment: Moment, context: EngineContext): number {
  const ageInDays = daysSince(moment.createdAt, context.currentTime);

  // Must be at least 6 months old to resurface
  if (ageInDays < 180) return 0;

  const dateRelevance = dateRelevanceScore(moment, context.currentTime);
  const memory = memoryScore(moment);
  const relationship = relationshipScoreForMoment(moment, context);
  const engagementPotential = engagementPotentialScore(moment);
  const sparkPotential = sparkPotentialScore(moment);
  const importantDayPotential = importantDayPotentialScore(moment, context);
  const novelty = noveltyScore(moment, context);
  const sensitivity = sensitivityPenalty(moment);
  const fatigue = fatiguePenalty(moment, context);

  return Math.max(
    0,
    dateRelevance * 0.20 +
    memory * 0.20 +
    relationship * 0.20 +
    engagementPotential * 0.15 +
    sparkPotential * 0.10 +
    importantDayPotential * 0.08 +
    novelty * 0.07 -
    sensitivity - fatigue
  );
}

export function selectResurfacedMemory(context: EngineContext): Moment | null {
  if (context.moments.length === 0) return null;

  const scored = context.moments
    .map((m) => ({ moment: m, score: scoreResurfacing(m, context) }))
    .filter((s) => s.score > 0.20)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.moment ?? null;
}

export interface ResurfacingAction {
  type: 'share_memory' | 'start_spark' | 'send_to_person' | 'add_to_clique' | 'recreate_memory';
  label: string;
  icon: string;
  targetId?: string;
}

export function buildResurfacingActions(moment: Moment, context: EngineContext): ResurfacingAction[] {
  const actions: ResurfacingAction[] = [];

  if (moment.people.length > 0) {
    const closest = moment.people.reduce((best: MomentPerson, p: MomentPerson) => {
      const score = computeClosenessScore(p.id, context);
      const bestScore = computeClosenessScore(best.id, context);
      return score > bestScore ? p : best;
    });
    actions.push({
      type: 'send_to_person',
      label: `Send to ${closest.name}`,
      icon: '💬',
      targetId: closest.id,
    });
  }

  actions.push({ type: 'share_memory', label: 'Reshare memory', icon: '✨' });

  if (moment.people.length > 0) {
    actions.push({ type: 'start_spark', label: 'Start a Spark', icon: '⚡' });
  }

  if (moment.location) {
    actions.push({ type: 'recreate_memory', label: 'Recreate this', icon: '📸' });
  }

  return actions.slice(0, 3);
}
