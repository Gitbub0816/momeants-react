import type { Moment } from './moment';
import type { Spark, SparkDelivery } from './spark';
import type { CalendarEvent } from './calendar-event';
import type { CircleMember } from './circle';

export type FeedItemType =
  | 'moment'
  | 'circle_moment'
  | 'resurfaced_memory'
  | 'spark_card'
  | 'minigame_spark'
  | 'important_day'
  | 'birthday_reminder'
  | 'anniversary'
  | 'engagement_prompt'
  | 'memory_anniversary'
  | 'clique_update'
  | 'bestie_update'
  | 'trip_memory'
  | 'gratitude_nudge'
  | 'conversation_starter';

export type FeedItemPriority = 'critical' | 'high' | 'medium' | 'low';

export interface FeedEngagementPrompt {
  type: 'react' | 'comment' | 'reshare' | 'message' | 'spark';
  label: string;
  icon: string;
  targetId?: string;
}

export interface RankedFeedItem {
  key: string;
  type: FeedItemType;
  priority: FeedItemPriority;
  score: number;
  moment?: Moment;
  spark?: Spark;
  sparkDelivery?: SparkDelivery;
  calendarEvent?: CalendarEvent;
  circleMember?: CircleMember;
  engagementPrompts?: FeedEngagementPrompt[];
  resurfaceLabel?: string;
  headline?: string;
  subtext?: string;
  accentColor?: string;
  insertedAt?: number;
}
