import type {
  Moment,
  CreateMomentInput,
  TimelineGroup,
  TimelineParams,
} from './moment';
import type { UserProfile, OnboardingData } from './user';
import type { CircleMember, CircleMoment } from './circle';
import type { Clique, CliqueType } from './clique';
import type { CalendarInference } from './calendar-intelligence';
import type { SparkDelivery, SparkSettings } from './spark';
import type { Conversation, Message } from './message';
import type { CalendarEvent } from './calendar-event';
import type { Notification } from './notification';

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
  searchUsers(query: string): Promise<UserProfile[]>;
  addToCircle(userId: string): Promise<void>;
  removeFromCircle(userId: string): Promise<void>;
  sendConnectionRequest(userId: string): Promise<void>;
  getConnectionRequests(): Promise<Array<{ userId: string; displayName: string; avatarUri?: string; sentAt: string }>>;
  acceptConnectionRequest(userId: string): Promise<void>;
  declineConnectionRequest(userId: string): Promise<void>;

  // Cliques
  createClique(name: string, memberIds: string[], type?: CliqueType, emoji?: string): Promise<Clique>;
  updateClique(id: string, data: { name?: string; memberIds?: string[]; emoji?: string; type?: CliqueType }): Promise<Clique>;
  deleteClique(id: string): Promise<void>;
  listCliques(): Promise<Clique[]>;

  // Sharing
  shareMoment(momentId: string, toUserId: string, message?: string): Promise<void>;

  // Calendar Intelligence
  getCalendarInferences(): Promise<CalendarInference[]>;
  confirmCalendarInference(inference: CalendarInference): Promise<CalendarEvent>;
  dismissCalendarInference(momentId: string, inferredType: string): Promise<void>;
  createCalendarEvent(event: { title: string; date: string; type: string; emoji?: string; personId?: string; isRecurring?: boolean }): Promise<CalendarEvent>;

  // Profile
  getProfile(userId?: string): Promise<UserProfile>;
  getUserProfile(userId: string): Promise<UserProfile>;
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
  createConversation(participantIds: string[], cliqueId?: string): Promise<Conversation>;

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

  // Notifications
  listNotifications(): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<void>;

  // Push tokens
  savePushToken(token: string): Promise<void>;
}
