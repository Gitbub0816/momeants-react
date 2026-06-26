import type { CalendarEvent, RankedFeedItem, Moment, MomentPerson } from '@momeants/types';
import type { EngineContext } from './types';
import { computeClosenessScore } from './relationshipEngine';

function dateProximityScore(event: CalendarEvent, now: Date): number {
  const eventDate = new Date(event.date + 'T00:00:00');
  const thisYear = new Date(now.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const diff = (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (diff < 0 && diff >= -1) return 0.9; // yesterday
  if (diff === 0) return 1.0; // today
  if (diff <= 1) return 0.95; // tomorrow
  if (diff <= 3) return 0.85;
  if (diff <= 7) return 0.70;
  if (diff <= 14) return 0.50;
  if (diff <= 30) return 0.30;
  return 0; // events more than 30 days away should not fire
}

function relationshipRelevanceScore(event: CalendarEvent, context: EngineContext): number {
  if (event.personId) {
    return computeClosenessScore(event.personId, context);
  }
  if (event.cliqueId) {
    const clique = context.cliques.find((c) => c.id === event.cliqueId);
    if (!clique) return 0.3;
    const memberScores = clique.members.map((m) => computeClosenessScore(m.userId, context));
    return Math.max(...memberScores) * 0.85;
  }
  return 0.3;
}

function milestoneImportanceScore(event: CalendarEvent): number {
  const scores: Record<string, number> = {
    birthday: 0.95,
    anniversary: 1.0,
    memory_anniversary: 0.90,
    trip: 0.75,
    holiday: 0.65,
    clique_event: 0.70,
    custom: 0.60,
  };
  return scores[event.type] ?? 0.5;
}

function engagementPotentialScore(event: CalendarEvent, context: EngineContext): number {
  // Events tied to people with shared moments have high engagement potential
  if (!event.personId) return 0.4;
  const sharedMoments = context.moments.filter(
    (m: Moment) => m.people.some((p: MomentPerson) => p.id === event.personId)
  );
  const basePotential = Math.min(1, sharedMoments.length / 5) * 0.5 + 0.4;
  return Math.min(1, basePotential);
}

function resurfacingPotentialScore(event: CalendarEvent, context: EngineContext): number {
  if (!event.personId) return 0.2;
  const relatedMoments = context.moments.filter(
    (m: Moment) =>
      m.people.some((p: MomentPerson) => p.id === event.personId) &&
      new Date(m.createdAt).getFullYear() < context.currentTime.getFullYear()
  );
  return relatedMoments.length > 0 ? 0.85 : 0.2;
}

function sparkPotentialScore(event: CalendarEvent, context: EngineContext): number {
  if (!event.personId) return 0.3;
  const closeness = computeClosenessScore(event.personId, context);
  return closeness * 0.9;
}

export function scoreImportantDay(event: CalendarEvent, context: EngineContext): number {
  const dateProximity = dateProximityScore(event, context.currentTime);
  if (dateProximity < 0.05) return 0; // too far out

  const relationshipRelevance = relationshipRelevanceScore(event, context);
  const milestoneImportance = milestoneImportanceScore(event);
  const engagementPotential = engagementPotentialScore(event, context);
  const resurfacingPotential = resurfacingPotentialScore(event, context);
  const sparkPotential = sparkPotentialScore(event, context);

  return Math.max(
    0,
    Math.min(
      1,
      dateProximity * 0.22 +
      relationshipRelevance * 0.22 +
      milestoneImportance * 0.20 +
      engagementPotential * 0.16 +
      resurfacingPotential * 0.10 +
      sparkPotential * 0.10
    )
  );
}

export function rankImportantDays(
  events: CalendarEvent[],
  context: EngineContext
): CalendarEvent[] {
  return [...events]
    .map((e) => ({ event: e, score: scoreImportantDay(e, context) }))
    .filter((s) => s.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.event);
}

const EVENT_COLORS: Record<string, string> = {
  birthday: '#FF7AC8',
  anniversary: '#FF6E91',
  memory_anniversary: '#B57CFF',
  trip: '#78A7FF',
  holiday: '#FFD28A',
  clique_event: '#78A7FF',
  custom: '#FFB38A',
};

export function buildImportantDayCard(
  event: CalendarEvent,
  context: EngineContext
): RankedFeedItem {
  const score = scoreImportantDay(event, context);
  const accent = EVENT_COLORS[event.type] ?? '#B57CFF';
  const eventDate = new Date(event.date + 'T00:00:00');
  const daysUntil = Math.ceil((eventDate.getTime() - context.currentTime.getTime()) / (1000 * 60 * 60 * 24));
  const daysLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;

  return {
    key: `important_day_${event.id}`,
    type: event.type === 'birthday' ? 'birthday_reminder'
      : event.type === 'anniversary' ? 'anniversary'
      : event.type === 'memory_anniversary' ? 'memory_anniversary'
      : 'important_day',
    priority: daysUntil <= 1 ? 'critical' : daysUntil <= 3 ? 'high' : 'medium',
    score,
    calendarEvent: event,
    headline: event.title,
    subtext: `${daysLabel} · ${event.emoji ?? '📅'} ${event.description ?? ''}`.trim(),
    accentColor: accent,
  };
}
