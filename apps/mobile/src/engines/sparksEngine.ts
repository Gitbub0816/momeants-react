import type { Spark, SparkDelivery, RankedFeedItem } from '@momeants/types';
import type { EngineContext } from './types';
import { computeClosenessScore } from './relationshipEngine';

// --- Scoring helpers ---

function relationshipFitScore(spark: Spark, context: EngineContext): number {
  if (spark.suitableForSolo) return 0.5;
  const closestScore = context.relationshipWeights.reduce((max, rw) => {
    const cs = computeClosenessScore(rw.targetId, context);
    return cs > max ? cs : max;
  }, 0);

  // Boost if spark targets the right relationship type
  const hasMatchingType = spark.relationshipTypes.some((rt: string) =>
    context.relationshipWeights.some((rw) => rw.relationshipType === rt)
  );
  return closestScore * (hasMatchingType ? 1.0 : 0.6);
}

function engagementPotentialForSpark(spark: Spark): number {
  return Math.min(1, (spark.engagementScore ?? spark.conversationScore) / 10);
}

function timingFitScore(spark: Spark, context: EngineContext): number {
  const hour = context.currentTime.getHours();
  const dayOfWeek = context.currentTime.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Evenings and weekends are peak engagement windows
  if ((hour >= 18 && hour <= 22) || isWeekend) return 1.0;
  if (hour >= 12 && hour <= 17) return 0.75;
  if (hour >= 8 && hour <= 11) return 0.60;
  return 0.30;
}

function memoryPotentialScore(spark: Spark): number {
  return Math.min(1, spark.memoryPotential / 10);
}

function conversationScoreForSpark(spark: Spark): number {
  return Math.min(1, spark.conversationScore / 10);
}

function noveltyScoreForSpark(spark: Spark, context: EngineContext): number {
  const usedThisWeek = context.sparkHistory.filter((d) => {
    const daysAgo = (context.currentTime.getTime() - new Date(d.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7 && d.spark.gameType === spark.gameType;
  });
  if (usedThisWeek.length > 0) return 0.05; // strongly penalize same type in 7 days

  const usedIn30 = context.sparkHistory.filter((d) => {
    const daysAgo = (context.currentTime.getTime() - new Date(d.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30 && d.spark.id === spark.id;
  });
  if (usedIn30.length > 0) return 0.0; // zero novelty for same template in 30 days

  return Math.min(1, spark.noveltyScore / 10);
}

function completionLikelihoodScore(spark: Spark, context: EngineContext): number {
  const base = spark.completionLikelihood ?? 0.6;
  // Completed sparks of this category increase likelihood
  const pastCompleted = context.sparkHistory.filter(
    (d) => d.status === 'completed' && d.spark.category === spark.category
  );
  const boost = Math.min(0.2, pastCompleted.length * 0.04);
  return Math.min(1, base + boost);
}

function fatiguePenaltyForSpark(context: EngineContext): number {
  const recentSparks = context.sparkHistory.filter((d) => {
    const hoursAgo = (context.currentTime.getTime() - new Date(d.deliveredAt).getTime()) / (1000 * 60 * 60);
    return hoursAgo <= 24;
  });
  // More than 2 sparks today = significant fatigue
  if (recentSparks.length >= 3) return 0.40;
  if (recentSparks.length >= 2) return 0.20;
  return 0;
}

function dismissalPenalty(spark: Spark, context: EngineContext): number {
  const dismissed = context.sparkHistory.filter(
    (d) => d.status === 'dismissed' && d.spark.category === spark.category
  );
  return Math.min(0.30, dismissed.length * 0.06);
}

export function scoreSpark(spark: Spark, context: EngineContext): number {
  if (context.dismissedSparkIds.has(spark.id)) return 0;
  if (spark.active === false) return 0;

  const novelty = noveltyScoreForSpark(spark, context);
  if (novelty === 0) return 0;

  const relationshipFit = relationshipFitScore(spark, context);
  const engagementPotential = engagementPotentialForSpark(spark);
  const timingFit = timingFitScore(spark, context);
  const memoryPotential = memoryPotentialScore(spark);
  const conversationScore = conversationScoreForSpark(spark);
  const completionLikelihood = completionLikelihoodScore(spark, context);
  const fatigue = fatiguePenaltyForSpark(context);
  const dismissal = dismissalPenalty(spark, context);

  return Math.max(
    0,
    relationshipFit * 0.22 +
    engagementPotential * 0.20 +
    timingFit * 0.15 +
    memoryPotential * 0.14 +
    conversationScore * 0.12 +
    novelty * 0.09 +
    completionLikelihood * 0.08 -
    fatigue - dismissal
  );
}

export function rankSparks(sparks: Spark[], context: EngineContext): Spark[] {
  return [...sparks]
    .map((s) => ({ spark: s, score: scoreSpark(s, context) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.spark);
}

export function selectBackgroundSpark(context: EngineContext): Spark | null {
  const candidates = context.availableSparks.filter((s) => s.mode === 'background_engagement');
  const ranked = rankSparks(candidates, context);
  return ranked[0] ?? null;
}

export function selectMinigame(context: EngineContext): Spark | null {
  const candidates = context.availableSparks.filter((s) => s.mode === 'minigame');
  const ranked = rankSparks(candidates, context);
  return ranked[0] ?? null;
}

export function buildSparkFeedCard(spark: Spark, context: EngineContext): RankedFeedItem {
  const score = scoreSpark(spark, context);
  return {
    key: `spark_${spark.id}`,
    type: spark.mode === 'minigame' ? 'minigame_spark' : 'spark_card',
    priority: score > 0.7 ? 'high' : 'medium',
    score,
    spark,
    headline: spark.title,
    subtext: spark.description,
    accentColor: '#B57CFF',
  };
}

export function checkSparkFatigueRules(context: EngineContext): {
  allowProminentHomeSpark: boolean;
  backgroundSparksRemainingToday: number;
} {
  const today = context.currentTime.toISOString().split('T')[0];
  const todaySparks = context.sparkHistory.filter((d) => d.deliveredAt.startsWith(today));
  const prominentToday = todaySparks.filter((d) => d.spark.mode === 'minigame');
  const backgroundToday = todaySparks.filter((d) => d.spark.mode === 'background_engagement');

  return {
    allowProminentHomeSpark: prominentToday.length < 1,
    backgroundSparksRemainingToday: Math.max(0, 2 - backgroundToday.length),
  };
}
