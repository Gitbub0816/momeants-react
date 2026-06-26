export type ModerationTier = 'safe' | 'review_required' | 'auto_reject';

export type ModerationCategory =
  | 'nudity'
  | 'violence'
  | 'hate_speech'
  | 'spam'
  | 'self_harm'
  | 'harassment'
  | 'minor_safety'
  | 'graphic_content';

export interface ModerationSignal {
  category: ModerationCategory;
  confidence: number;  // 0-1
  source: 'image_ml' | 'caption_nlp' | 'comment_nlp' | 'report';
}

export interface ModerationResult {
  contentId: string;
  contentType: 'moment' | 'comment' | 'caption';
  tier: ModerationTier;
  signals: ModerationSignal[];
  requiresHumanReview: boolean;
  autoActionTaken?: 'hidden' | 'removed' | 'flagged';
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  contentId: string;
  contentType: 'moment' | 'comment';
  reason: ModerationCategory;
  additionalNotes?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}
