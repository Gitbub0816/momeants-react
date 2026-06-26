/**
 * Content Moderation Engine
 *
 * Architecture:
 * - `moderateImage(uri)` → calls Google Cloud Vision API (SafeSearch + Labels)
 * - `moderateText(text)` → NLP-based keyword + pattern matching
 * - `runModerationPipeline(moment)` → combines both, returns ModerationResult
 *
 * In production, set EXPO_PUBLIC_GCV_API_KEY. In demo mode, the mock
 * implementation runs client-side keyword checks only.
 *
 * Vision API SafeSearch categories: ADULT, SPOOF, MEDICAL, VIOLENCE, RACY
 * Each returns: UNKNOWN, VERY_UNLIKELY, UNLIKELY, POSSIBLE, LIKELY, VERY_LIKELY
 */

import type { Moment, MomentComment } from '@momeants/types';
import type { ModerationResult, ModerationSignal, ModerationTier, ModerationCategory } from '@momeants/types';

// ── Google Cloud Vision types ────────────────────────────────────────────────

type VisionLikelihood = 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';

interface VisionSafeSearch {
  adult: VisionLikelihood;
  spoof: VisionLikelihood;
  medical: VisionLikelihood;
  violence: VisionLikelihood;
  racy: VisionLikelihood;
}

interface VisionLabel {
  description: string;
  score: number;
}

const LIKELIHOOD_SCORE: Record<VisionLikelihood, number> = {
  UNKNOWN: 0,
  VERY_UNLIKELY: 0.05,
  UNLIKELY: 0.15,
  POSSIBLE: 0.50,
  LIKELY: 0.80,
  VERY_LIKELY: 0.95,
};

// ── Text moderation ──────────────────────────────────────────────────────────

interface TextPattern {
  keywords: string[];
  category: ModerationCategory;
  confidence: number;
}

const TEXT_PATTERNS: TextPattern[] = [
  {
    keywords: ['kill', 'murder', 'die', 'hurt', 'attack', 'stab', 'shoot'],
    category: 'violence',
    confidence: 0.60,
  },
  {
    keywords: ['hate', 'racist', 'bigot', 'nigger', 'nigga', 'faggot', 'fag', 'dyke', 'tranny', 'spic', 'chink', 'kike', 'wetback', 'cracker', 'coon', 'gook', 'towelhead', 'raghead', 'beaner', 'retard', 'spaz'],
    category: 'hate_speech',
    confidence: 0.70,
  },
  {
    keywords: ['kms', 'end it all', 'suicidal', 'don\'t want to live'],
    category: 'self_harm',
    confidence: 0.75,
  },
  {
    keywords: ['buy now', 'click here', 'limited offer', 'dm for promo', 'free money'],
    category: 'spam',
    confidence: 0.65,
  },
  {
    keywords: ['follow me', 'check bio', 'link in bio', 'discount code'],
    category: 'spam',
    confidence: 0.45,
  },
];

function moderateText(text: string, source: 'caption' | 'comment'): ModerationSignal[] {
  const signals: ModerationSignal[] = [];
  const normalized = text.toLowerCase();

  for (const pattern of TEXT_PATTERNS) {
    const matches = pattern.keywords.filter((kw) => normalized.includes(kw));
    if (matches.length > 0) {
      const confidence = Math.min(0.95, pattern.confidence * (matches.length / Math.max(1, pattern.keywords.length / 2)));
      signals.push({
        category: pattern.category,
        confidence,
        source: source === 'caption' ? 'caption_nlp' : 'comment_nlp',
      });
    }
  }

  return signals;
}

// ── Google Cloud Vision API call ─────────────────────────────────────────────

async function callVisionApi(imageUri: string, apiKey: string): Promise<{
  safeSearch: VisionSafeSearch;
  labels: VisionLabel[];
} | null> {
  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri } },
              features: [
                { type: 'SAFE_SEARCH_DETECTION' },
                { type: 'LABEL_DETECTION', maxResults: 20 },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const result = data.responses?.[0];
    if (!result) return null;

    return {
      safeSearch: result.safeSearchAnnotation ?? {},
      labels: result.labelAnnotations ?? [],
    };
  } catch {
    return null;
  }
}

function signalsFromVision(safeSearch: VisionSafeSearch): ModerationSignal[] {
  const signals: ModerationSignal[] = [];

  const map: [keyof VisionSafeSearch, ModerationCategory][] = [
    ['adult', 'nudity'],
    ['violence', 'violence'],
    ['racy', 'graphic_content'],
    ['medical', 'graphic_content'],
  ];

  for (const [key, category] of map) {
    const likelihood = safeSearch[key] as VisionLikelihood;
    const confidence = LIKELIHOOD_SCORE[likelihood] ?? 0;
    if (confidence >= 0.15) {
      signals.push({ category, confidence, source: 'image_ml' });
    }
  }

  return signals;
}

// ── Tier decision ────────────────────────────────────────────────────────────

function decideTier(signals: ModerationSignal[]): ModerationTier {
  for (const signal of signals) {
    // Immediate auto-reject threshold
    if (signal.confidence >= 0.80) {
      if (signal.category === 'nudity' || signal.category === 'minor_safety' || signal.category === 'self_harm') {
        return 'auto_reject';
      }
      if (signal.category === 'violence' || signal.category === 'hate_speech') {
        return 'auto_reject';
      }
    }

    // Human review threshold — intentionally lenient to avoid over-moderation
    if (signal.confidence >= 0.50) {
      if (signal.category !== 'spam') {
        return 'review_required';
      }
    }

    // Spam at medium confidence: review
    if (signal.category === 'spam' && signal.confidence >= 0.65) {
      return 'review_required';
    }
  }

  return 'safe';
}

// ── Mock implementation (no API key) ────────────────────────────────────────
// Used in demo mode. Returns safe for most content; catches obvious text issues.

// No-op image moderation used when EXPO_PUBLIC_GCV_API_KEY is not set.
// Real image moderation requires a Google Cloud Vision API key — set EXPO_PUBLIC_GCV_API_KEY.
let _gcvWarningLogged = false;
function noopModerateImage(_uri: string): ModerationSignal[] {
  if (!_gcvWarningLogged) {
    _gcvWarningLogged = true;
    console.warn('[moderationEngine] EXPO_PUBLIC_GCV_API_KEY is not set — image moderation is disabled. Set the key for real SafeSearch detection.');
  }
  return [];
}

// ── Main pipeline ────────────────────────────────────────────────────────────

export interface ModerationConfig {
  visionApiKey?: string;
  enableImageModeration: boolean;
  enableTextModeration: boolean;
  strictnessLevel: 'lenient' | 'standard' | 'strict';
}

const DEFAULT_CONFIG: ModerationConfig = {
  enableImageModeration: true,
  enableTextModeration: true,
  strictnessLevel: 'standard',
};

export async function moderateMoment(
  moment: Moment,
  config: ModerationConfig = DEFAULT_CONFIG
): Promise<ModerationResult> {
  const signals: ModerationSignal[] = [];

  // Text moderation — always available
  if (config.enableTextModeration) {
    if (moment.caption) {
      signals.push(...moderateText(moment.caption, 'caption'));
    }
    moment.comments.forEach((c: MomentComment) => {
      signals.push(...moderateText(c.text, 'comment'));
    });
  }

  // Image moderation
  if (config.enableImageModeration) {
    if (config.visionApiKey) {
      const visionResult = await callVisionApi(moment.imageUri, config.visionApiKey);
      if (visionResult) {
        signals.push(...signalsFromVision(visionResult.safeSearch));
      }
    } else {
      // Demo mode
      signals.push(...noopModerateImage(moment.imageUri));
    }
  }

  // Lenient mode: raise thresholds
  const adjustedSignals = config.strictnessLevel === 'lenient'
    ? signals.map((s) => ({ ...s, confidence: s.confidence * 0.75 }))
    : config.strictnessLevel === 'strict'
    ? signals.map((s) => ({ ...s, confidence: Math.min(1, s.confidence * 1.20) }))
    : signals;

  const tier = decideTier(adjustedSignals);

  return {
    contentId: moment.id,
    contentType: 'moment',
    tier,
    signals: adjustedSignals,
    requiresHumanReview: tier === 'review_required',
    autoActionTaken: tier === 'auto_reject' ? 'hidden' : undefined,
  };
}

export async function moderateComment(
  commentId: string,
  text: string,
  config: ModerationConfig = DEFAULT_CONFIG
): Promise<ModerationResult> {
  const signals = config.enableTextModeration ? moderateText(text, 'comment') : [];
  const tier = decideTier(signals);

  return {
    contentId: commentId,
    contentType: 'comment',
    tier,
    signals,
    requiresHumanReview: tier === 'review_required',
    autoActionTaken: tier === 'auto_reject' ? 'hidden' : undefined,
  };
}

// ── Batch moderation helper ──────────────────────────────────────────────────

export async function moderateMomentsBatch(
  moments: Moment[],
  config: ModerationConfig = DEFAULT_CONFIG
): Promise<Map<string, ModerationResult>> {
  const results = new Map<string, ModerationResult>();
  // Process in batches of 5 to avoid overwhelming Vision API quotas
  for (let i = 0; i < moments.length; i += 5) {
    const batch = moments.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map((m) => moderateMoment(m, config)));
    batchResults.forEach((r, idx) => results.set(batch[idx].id, r));
  }
  return results;
}
