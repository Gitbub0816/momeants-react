import type { Moment, MomentPerson, MoodTag } from '@momeants/types';
import type { FeedEngagementPrompt } from '@momeants/types';
import type { EngineContext } from './types';
import { computeClosenessScore } from './relationshipEngine';

export interface CommentPrompt {
  text: string;
  type: 'appreciation' | 'question' | 'memory' | 'reaction' | 'encouragement';
  warmth: 'gentle' | 'warm' | 'heartfelt';
}

export interface CommentNudge {
  momentId: string;
  shouldNudge: boolean;
  reason?: string;
  urgency: 'low' | 'medium' | 'high';
  prompts: CommentPrompt[];
  engagementPrompts: FeedEngagementPrompt[];
}

// ── Mood → comment tone mapping ──────────────────────────────────────────────

const MOOD_PROMPTS: Record<MoodTag, CommentPrompt[]> = {
  Peaceful: [
    { text: 'This looks so calming. 🌿', type: 'reaction', warmth: 'gentle' },
    { text: 'I needed this today.', type: 'reaction', warmth: 'gentle' },
  ],
  Grateful: [
    { text: 'Love that you shared this.', type: 'appreciation', warmth: 'warm' },
    { text: 'This is beautiful. What are you grateful for today?', type: 'question', warmth: 'warm' },
  ],
  Loved: [
    { text: 'This fills my heart. ❤️', type: 'appreciation', warmth: 'heartfelt' },
    { text: 'You look so happy here.', type: 'reaction', warmth: 'warm' },
  ],
  Excited: [
    { text: 'Tell me everything!! 🙌', type: 'question', warmth: 'warm' },
    { text: 'Your energy is contagious!', type: 'encouragement', warmth: 'warm' },
  ],
  Nostalgic: [
    { text: 'This takes me back.', type: 'memory', warmth: 'warm' },
    { text: 'I remember this! How long ago was this?', type: 'question', warmth: 'warm' },
    { text: 'Some memories just stay with you.', type: 'memory', warmth: 'heartfelt' },
  ],
  Proud: [
    { text: 'You should be so proud. 🌟', type: 'encouragement', warmth: 'heartfelt' },
    { text: 'This is huge! Congratulations.', type: 'appreciation', warmth: 'warm' },
  ],
  Free: [
    { text: 'This is everything. Where is this?', type: 'question', warmth: 'gentle' },
    { text: 'Living your best life. ✨', type: 'reaction', warmth: 'gentle' },
  ],
  Cozy: [
    { text: 'The coziest thing I\'ve seen all week.', type: 'reaction', warmth: 'gentle' },
    { text: 'I need this in my life.', type: 'reaction', warmth: 'gentle' },
  ],
  Adventurous: [
    { text: 'Where is this?! I need to go.', type: 'question', warmth: 'warm' },
    { text: 'I live for these moments from you.', type: 'appreciation', warmth: 'warm' },
  ],
};

// ── Closeness-based prompts ──────────────────────────────────────────────────

function buildClosenessPrompts(
  moment: Moment,
  authorCloseness: number,
  context: EngineContext
): CommentPrompt[] {
  if (authorCloseness >= 0.8) {
    // Bestie / family: personal, specific
    const prompts: CommentPrompt[] = [
      { text: `I was just thinking about you. ❤️`, type: 'appreciation', warmth: 'heartfelt' },
    ];
    if (moment.location) {
      prompts.push({
        text: `Wait — are you at ${moment.location.label}?!`,
        type: 'question',
        warmth: 'warm',
      });
    }
    if (moment.people.length > 1) {
      const others = moment.people.filter((p: MomentPerson) => p.id !== context.userId);
      if (others.length > 0) {
        prompts.push({
          text: `How is ${others[0].name} doing?`,
          type: 'question',
          warmth: 'heartfelt',
        });
      }
    }
    return prompts;
  }

  if (authorCloseness >= 0.5) {
    // Close friend: warm, interested
    const prompts: CommentPrompt[] = [
      { text: 'Love seeing this from you.', type: 'appreciation', warmth: 'warm' },
    ];
    if (moment.caption) {
      prompts.push({ text: 'This caption though. 💯', type: 'reaction', warmth: 'gentle' });
    }
    return prompts;
  }

  // Acquaintance / discovery: lighter touch
  return [
    { text: '✨', type: 'reaction', warmth: 'gentle' },
    { text: 'Beautiful.', type: 'reaction', warmth: 'gentle' },
  ];
}

// ── Nudge timing logic ───────────────────────────────────────────────────────

function hoursOld(moment: Moment, now: Date): number {
  return (now.getTime() - new Date(moment.createdAt).getTime()) / (1000 * 60 * 60);
}

function shouldNudge(
  moment: Moment,
  authorCloseness: number,
  context: EngineContext
): { should: boolean; reason?: string; urgency: 'low' | 'medium' | 'high' } {
  const age = hoursOld(moment, context.currentTime);

  // Already commented — no nudge
  const alreadyCommented = moment.comments.some((c) => c.authorId === context.userId);
  if (alreadyCommented) return { should: false, urgency: 'low' };

  // Too old (more than 48h) — comment window mostly closed
  if (age > 48) return { should: false, urgency: 'low' };

  // Very close person posted something emotional: high urgency within first 4h
  if (authorCloseness >= 0.8) {
    if (age <= 4) return { should: true, reason: 'Someone you care about just shared something', urgency: 'high' };
    if (age <= 24) return { should: true, reason: 'Don\'t miss this one', urgency: 'medium' };
  }

  // Close friend, emotional mood
  const emotionalMoods: MoodTag[] = ['Loved', 'Proud', 'Nostalgic', 'Grateful'];
  const hasEmotionalMood = moment.moods.some((m) => emotionalMoods.includes(m));
  if (authorCloseness >= 0.5 && hasEmotionalMood && age <= 12) {
    return { should: true, reason: 'They\'d love to hear from you', urgency: 'medium' };
  }

  // Others already commented and we haven't — join the conversation
  if (moment.comments.length >= 2 && age <= 24 && authorCloseness >= 0.4) {
    return { should: true, reason: 'Others are already talking about this', urgency: 'low' };
  }

  return { should: false, urgency: 'low' };
}

// ── Main API ─────────────────────────────────────────────────────────────────

export function buildCommentNudge(moment: Moment, context: EngineContext): CommentNudge {
  const authorCloseness = computeClosenessScore(moment.authorId, context);
  const nudgeDecision = shouldNudge(moment, authorCloseness, context);

  // Build comment prompts
  const prompts: CommentPrompt[] = [];

  // Mood-based suggestions
  for (const mood of moment.moods.slice(0, 2)) {
    const moodPrompts = MOOD_PROMPTS[mood] ?? [];
    prompts.push(...moodPrompts.slice(0, 1));
  }

  // Closeness-based suggestions
  prompts.push(...buildClosenessPrompts(moment, authorCloseness, context));

  // Deduplicate and limit
  const unique = prompts.filter((p, i) => prompts.findIndex((x) => x.text === p.text) === i);

  // Engagement action prompts (for UI action bar)
  const engagementPrompts: FeedEngagementPrompt[] = [
    { type: 'react', label: 'React', icon: '❤️' },
    { type: 'comment', label: 'Comment', icon: '💬' },
  ];

  if (moment.people.length > 0 && authorCloseness >= 0.5) {
    engagementPrompts.push({ type: 'spark', label: 'Start a Spark', icon: '⚡' });
  }

  return {
    momentId: moment.id,
    shouldNudge: nudgeDecision.should,
    reason: nudgeDecision.reason,
    urgency: nudgeDecision.urgency,
    prompts: unique.slice(0, 4),
    engagementPrompts,
  };
}

export function rankMomentsForCommentEngagement(
  moments: Moment[],
  context: EngineContext
): Array<{ moment: Moment; nudge: CommentNudge }> {
  return moments
    .map((m) => ({ moment: m, nudge: buildCommentNudge(m, context) }))
    .filter(({ nudge }) => nudge.shouldNudge)
    .sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.nudge.urgency] - urgencyOrder[a.nudge.urgency];
    });
}
