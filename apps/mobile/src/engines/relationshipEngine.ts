import type { CalendarEvent } from '@momeants/types';
import type { EngineContext, RelationshipWeight } from './types';

const RELATIONSHIP_BASE_WEIGHTS: Record<string, number> = {
  bestie: 1.0,
  couple: 0.97,
  family: 0.9,
  close_friend: 0.75,
  friend: 0.55,
  acquaintance: 0.30,
};

function daysSince(isoDate: string, now: Date): number {
  return (now.getTime() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}

function recencyScore(lastInteractionAt: string, now: Date): number {
  const days = daysSince(lastInteractionAt, now);
  if (days <= 1) return 1.0;
  if (days <= 7) return 0.85;
  if (days <= 14) return 0.65;
  if (days <= 30) return 0.45;
  if (days <= 90) return 0.25;
  return 0.10;
}

function sharedMomentScore(count: number): number {
  if (count === 0) return 0;
  return Math.min(1.0, count / 20);
}

function messageScore(frequency: number): number {
  // frequency: messages per week on average
  if (frequency >= 7) return 1.0;
  if (frequency >= 3) return 0.8;
  if (frequency >= 1) return 0.6;
  if (frequency >= 0.5) return 0.4;
  return 0.15;
}

function sparkParticipationScore(count: number): number {
  return Math.min(1.0, count / 10);
}

function commentReplyScore(count: number): number {
  return Math.min(1.0, count / 15);
}

function importantDaySharedScore(targetId: string, context: EngineContext): number {
  const shared = context.calendarEvents.filter(
    (e: CalendarEvent) => e.personId === targetId || (e.cliqueId && context.cliques.some(
      (c) => c.id === e.cliqueId && c.members.some((m) => m.userId === targetId)
    ))
  );
  return Math.min(1.0, shared.length / 5);
}

export function computeClosenessScore(
  targetId: string,
  context: EngineContext
): number {
  const rw = context.relationshipWeights.find((r) => r.targetId === targetId);

  const manualWeight = rw
    ? RELATIONSHIP_BASE_WEIGHTS[rw.relationshipType] ?? 0.3
    : 0.3;

  const sharedMoments = rw ? sharedMomentScore(rw.sharedMomentCount) : 0;
  const messages = rw ? messageScore(rw.messageFrequency) : 0;
  const sparkParticipation = rw ? sparkParticipationScore(rw.sparkParticipationCount) : 0;
  const commentReplies = rw ? commentReplyScore(rw.commentReplyCount) : 0;
  const importantDays = importantDaySharedScore(targetId, context);
  const recency = rw ? recencyScore(rw.lastInteractionAt, context.currentTime) : 0.1;

  const score =
    manualWeight * 0.25 +
    sharedMoments * 0.18 +
    messages * 0.16 +
    sparkParticipation * 0.16 +
    commentReplies * 0.10 +
    importantDays * 0.08 +
    recency * 0.07;

  return Math.max(0, Math.min(1, score));
}

export function rankCircleMembersByCloseness(context: EngineContext): string[] {
  const scored = context.circleMembers
    .map((m) => ({ id: m.id, score: computeClosenessScore(m.id, context) }))
    .sort((a, b) => b.score - a.score);
  return scored.map((s) => s.id);
}

export function getRelationshipType(targetId: string, context: EngineContext): string {
  const rw = context.relationshipWeights.find((r) => r.targetId === targetId);
  return rw?.relationshipType ?? 'friend';
}
