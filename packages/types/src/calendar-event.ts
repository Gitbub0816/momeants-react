export type CalendarEventType =
  | 'birthday'
  | 'anniversary'
  | 'holiday'
  | 'memory_anniversary'
  | 'trip'
  | 'clique_event'
  | 'custom';

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  description?: string;
  date: string; // ISO date string
  isRecurring: boolean;
  recurringYear?: number; // original year for anniversaries
  personId?: string;
  personName?: string;
  personAvatarUri?: string;
  cliqueId?: string;
  cliqueName?: string;
  momentId?: string; // linked memory
  sparkId?: string; // scheduled spark
  emoji?: string;
}
