import type { CalendarEventType } from './calendar-event';

export type InferenceSource = 'caption' | 'comment' | 'image_label' | 'pattern' | 'onboarding';

export type InferredEventType = CalendarEventType | 'graduation' | 'new_job' | 'new_home' | 'baby' | 'engagement' | 'first_day' | 'achievement' | 'reunion';

export interface CalendarInference {
  momentId: string;
  inferredType: InferredEventType;
  confidence: number;         // 0-1
  source: InferenceSource;
  involvedPersonIds: string[];
  involvedPersonNames: string[];
  suggestedTitle: string;
  suggestedEmoji: string;
  suggestedDate: string;      // ISO date, usually the moment's createdAt date
  isRecurring: boolean;
  notes?: string;
  requiresConfirmation: boolean; // always true for inferred events
}

export interface CalendarNudge {
  type: 'approaching_event' | 'anniversary_today' | 'inferred_milestone' | 'spark_suggestion';
  calendarEventId?: string;
  inference?: CalendarInference;
  headline: string;
  subtext: string;
  sparkRecommended: boolean;
  suggestedSparkCategory?: string;
  daysUntil?: number;
  personIds: string[];
}
