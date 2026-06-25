import type {
  Moment,
  CreateMomentInput,
  TimelineGroup,
  TimelineParams,
} from './moment';
import type { UserProfile, OnboardingData } from './user';
import type { CircleMember, CircleMoment } from './circle';
import type { SparkDelivery, SparkSettings } from './spark';
import type { Conversation, Message } from './message';
import type { CalendarEvent } from './calendar-event';

export interface MomentsApi {
  // Moments
  createMoment(input: CreateMomentInput): Promise<Moment>;
  getMoment(id: string): Promise<Moment>;
  listHomeMoments(): Promise<{ hero: Moment; recent: Moment[]; resurfaced?: Moment }>;
  listTimeline(params: TimelineParams): Promise<TimelineGroup[]>;
  reactToMoment(momentId: string, emoji: string): Promise<void>;
  commentOnMoment(momentId: string, text: string): Promise<void>;

  // Circle
  listCircleMembers(): Promise<CircleMember[]>;
  listCircleMoments(): Promise<CircleMoment[]>;

  // Profile
  getProfile(userId?: string): Promise<UserProfile>;
  updateProfile(data: Partial<OnboardingData>): Promise<UserProfile>;

  // Auth
  signInWithEmail(email: string, password: string): Promise<{ userId: string }>;
  signUpWithEmail(email: string, password: string): Promise<{ userId: string }>;
  signOut(): Promise<void>;
  completeOnboarding(data: OnboardingData): Promise<UserProfile>;

  // Messages
  listConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | null>;
  sendMessage(conversationId: string, text: string): Promise<Message>;

  // Calendar
  listCalendarEvents(): Promise<CalendarEvent[]>;

  // Sparks
  getTodaySpark(): Promise<SparkDelivery | null>;
  acceptSpark(deliveryId: string): Promise<void>;
  dismissSpark(deliveryId: string): Promise<void>;
  completeSpark(deliveryId: string, momentId?: string): Promise<void>;
  getSparkHistory(limit?: number): Promise<SparkDelivery[]>;
  getSparkSettings(): Promise<SparkSettings>;
  updateSparkSettings(settings: Partial<SparkSettings>): Promise<SparkSettings>;
}
