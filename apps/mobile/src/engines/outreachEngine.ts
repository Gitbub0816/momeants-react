import type { Moment } from '@momeants/types';
import type { OutreachTarget, OutreachResult, OutreachTier } from '@momeants/types';
import type { EngineContext } from './types';
import { computeClosenessScore } from './relationshipEngine';

// ── Social distance helpers ─────────────────────────────────────────────────

function getFirstDegreeIds(context: EngineContext): Set<string> {
  const ids = new Set<string>();
  context.circleMembers.forEach((m) => ids.add(m.id));
  context.cliques.forEach((c) => c.members.forEach((m) => ids.add(m.userId)));
  return ids;
}

function getSecondDegreeIds(context: EngineContext): Set<string> {
  const firstDegree = getFirstDegreeIds(context);
  const secondDegree = new Set<string>();
  firstDegree.forEach((id) => {
    const friends = context.socialGraph.get(id);
    friends?.forEach((fofId) => {
      if (fofId !== context.userId && !firstDegree.has(fofId)) {
        secondDegree.add(fofId);
      }
    });
  });
  return secondDegree;
}

// ── Amplification scoring ───────────────────────────────────────────────────

function organicAmplificationScore(moment: Moment): number {
  // How likely is this post to spread organically?
  // Based on reactions, comments, and content richness — NOT follower count.
  // This intentionally rewards meaningful engagement over raw numbers.
  const totalReactions = moment.reactions.reduce((s, r) => s + r.count, 0);
  const commentCount = moment.comments.length;
  const peopleTagged = moment.people.length;
  const hasCaption = !!moment.caption;
  const hasLocation = !!moment.location;

  let score = 0;
  score += Math.min(0.30, totalReactions * 0.04);
  score += Math.min(0.25, commentCount * 0.06);
  score += peopleTagged > 0 ? 0.20 : 0;
  score += hasCaption ? 0.15 : 0;
  score += hasLocation ? 0.10 : 0;

  return Math.min(1, score);
}

// ── Per-target relevance ────────────────────────────────────────────────────

function targetRelevanceScore(
  targetId: string,
  tier: OutreachTier,
  moment: Moment,
  context: EngineContext
): number {
  if (tier === 'direct_circle') {
    return computeClosenessScore(targetId, context);
  }

  if (tier === 'clique_member') {
    // Clique members see content at slightly reduced relevance unless closely connected
    return computeClosenessScore(targetId, context) * 0.85;
  }

  if (tier === 'friend_of_friend') {
    // Second-degree: base is low; boosted if shared interests (moods/location)
    let base = 0.25;
    // Find which first-degree friend bridges this connection
    const firstDegree = getFirstDegreeIds(context);
    let bridgeBoost = 0;
    firstDegree.forEach((fId) => {
      const fFriends = context.socialGraph.get(fId);
      if (fFriends?.has(targetId)) {
        const bridgeCloseness = computeClosenessScore(fId, context);
        bridgeBoost = Math.max(bridgeBoost, bridgeCloseness * 0.35);
      }
    });
    return Math.min(0.55, base + bridgeBoost);
  }

  if (tier === 'organic_discovery') {
    // Very sparse reach to non-connected users; only if high amplification
    return organicAmplificationScore(moment) * 0.25;
  }

  return 0;
}

// ── Build targets ───────────────────────────────────────────────────────────

export function buildOutreachTargets(
  moment: Moment,
  context: EngineContext
): OutreachTarget[] {
  const targets: OutreachTarget[] = [];

  // Private moments never reach beyond the author
  if (moment.visibility === 'private') return targets;

  const firstDegree = getFirstDegreeIds(context);

  // 1. Direct circle
  firstDegree.forEach((userId) => {
    const score = computeClosenessScore(userId, context);
    if (score < 0.10) return; // too distant even within circle
    targets.push({
      userId,
      tier: 'direct_circle',
      socialDistance: 1,
      relevanceScore: score,
      reason: `In your circle`,
    });
  });

  // 2. Clique members (who aren't already in direct circle)
  context.cliques.forEach((clique) => {
    clique.members.forEach((member) => {
      if (firstDegree.has(member.userId) || member.userId === context.userId) return;
      targets.push({
        userId: member.userId,
        tier: 'clique_member',
        socialDistance: 1,
        relevanceScore: targetRelevanceScore(member.userId, 'clique_member', moment, context),
        reason: `In clique: ${clique.name}`,
      });
    });
  });

  // 3. Friends-of-friends (only if not private, amplification score high enough)
  const ampScore = organicAmplificationScore(moment);
  if (ampScore >= 0.35 && moment.visibility !== 'private') {
    const secondDegree = getSecondDegreeIds(context);
    secondDegree.forEach((userId) => {
      const score = targetRelevanceScore(userId, 'friend_of_friend', moment, context);
      if (score < 0.20) return; // floor for discovery
      targets.push({
        userId,
        tier: 'friend_of_friend',
        socialDistance: 2,
        relevanceScore: score,
        reason: `Friend of someone in your circle`,
      });
    });
  }

  return targets.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ── Main outreach result ────────────────────────────────────────────────────

export function computeOutreach(
  moment: Moment,
  context: EngineContext
): OutreachResult {
  const targets = buildOutreachTargets(moment, context);
  const ampScore = organicAmplificationScore(moment);
  const allowsDiscovery =
    moment.visibility !== 'private' && ampScore >= 0.40;

  return {
    momentId: moment.id,
    targets,
    estimatedReach: targets.length,
    amplificationScore: ampScore,
    privacyGate: moment.visibility === 'private'
      ? 'private'
      : moment.visibility === 'close_circle'
      ? 'close_circle'
      : 'open',
    allowsDiscovery,
  };
}

// ── Discovery feed candidates ───────────────────────────────────────────────
// Returns moments from outside direct circle that are worth showing in discovery

export interface DiscoveryCandidate {
  moment: Moment;
  socialDistance: 2 | 3;
  bridgePersonName?: string; // "Friend of Maya"
  discoveryScore: number;
}

export function rankDiscoveryCandidates(
  candidates: Moment[],
  context: EngineContext
): DiscoveryCandidate[] {
  const firstDegree = getFirstDegreeIds(context);
  const firstDegreeNames = new Map<string, string>();
  context.circleMembers.forEach((m) => firstDegreeNames.set(m.id, m.displayName));

  return candidates
    .filter((m) => !firstDegree.has(m.authorId) && m.authorId !== context.userId)
    .map((moment) => {
      const ampScore = organicAmplificationScore(moment);

      // Find bridge connection
      let bridgePersonName: string | undefined;
      let bridgeBoost = 0;
      firstDegree.forEach((fId) => {
        const fFriends = context.socialGraph.get(fId);
        if (fFriends?.has(moment.authorId)) {
          const closeness = computeClosenessScore(fId, context);
          if (closeness > bridgeBoost) {
            bridgeBoost = closeness;
            bridgePersonName = firstDegreeNames.get(fId);
          }
        }
      });

      const socialDistance: 2 | 3 = bridgePersonName ? 2 : 3;

      // Discovery score: heavily weights bridge closeness and organic engagement
      // Intentionally low ceiling so personal content always dominates
      const discoveryScore = Math.min(
        0.45,
        ampScore * 0.50 + bridgeBoost * 0.35 + (moment.people.length > 0 ? 0.10 : 0)
      );

      return { moment, socialDistance, bridgePersonName, discoveryScore };
    })
    .filter((c) => c.discoveryScore > 0.15)
    .sort((a, b) => b.discoveryScore - a.discoveryScore);
}
