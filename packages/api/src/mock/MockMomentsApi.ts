import type {
  MomentsApi,
  Moment,
  CreateMomentInput,
  TimelineGroup,
  TimelineParams,
  UserProfile,
  OnboardingData,
  CircleMember,
  CircleMoment,
  Clique,
  CliqueType,
  CliqueMember,
  CalendarInference,
  SparkDelivery,
  SparkSettings,
  Conversation,
  Message,
  CalendarEvent,
  Notification,
} from '@momeants/types';
import {
  MOCK_MOMENTS,
  MOCK_CIRCLE_MEMBERS,
  MOCK_CIRCLE_MOMENTS,
  MOCK_PROFILE,
} from './data';
import { SPARK_LIBRARY, DEFAULT_SPARK_SETTINGS } from './sparks';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES_BY_CONVO, MOCK_CALENDAR_EVENTS } from './messaging';
import { DEMO_CLIQUES } from './cliques';

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockMomentsApi implements MomentsApi {
  private moments: Moment[] = [...MOCK_MOMENTS];
  private sparkDeliveries: SparkDelivery[] = [];
  private sparkSettings: SparkSettings = { ...DEFAULT_SPARK_SETTINGS };
  private circleIds: Set<string> = new Set(MOCK_CIRCLE_MEMBERS.map((m) => m.id));
  private connectionRequests: Array<{ userId: string; displayName: string; avatarUri?: string; sentAt: string }> = [];
  private cliques: Clique[] = [...DEMO_CLIQUES];

  async createMoment(input: CreateMomentInput): Promise<Moment> {
    await delay();
    const moment: Moment = {
      id: String(Date.now()),
      authorId: 'me',
      imageUri: input.imageUri,
      caption: input.caption,
      moods: input.moods,
      visibility: input.visibility,
      people: input.people,
      location: input.location,
      musicTitle: input.musicTitle,
      musicArtist: input.musicArtist,
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.moments.unshift(moment);
    return moment;
  }

  async getMoment(id: string): Promise<Moment> {
    await delay(200);
    const moment = this.moments.find((m) => m.id === id);
    if (!moment) throw new Error(`Moment ${id} not found`);
    return moment;
  }

  async listHomeMoments(): Promise<{ hero: Moment; recent: Moment[]; resurfaced?: Moment }> {
    await delay();
    const sorted = [...this.moments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const resurfaced = sorted.find((m) => m.isResurfaced);
    const regular = sorted.filter((m) => !m.isResurfaced);
    return { hero: regular[0], recent: regular.slice(1, 5), resurfaced };
  }

  async listTimeline(params: TimelineParams): Promise<TimelineGroup[]> {
    await delay();
    const sorted = [...this.moments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const groups = new Map<string, Moment[]>();
    for (const moment of sorted) {
      const date = new Date(moment.createdAt);
      const key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(moment);
    }
    return Array.from(groups.entries()).map(([label, moments]) => ({
      dateLabel: label,
      isoDate: moments[0].createdAt,
      moments,
    }));
  }

  async reactToMoment(momentId: string, emoji: string): Promise<void> {
    await delay(100);
    const moment = this.moments.find((m) => m.id === momentId);
    if (!moment) return;
    const existing = moment.reactions.find((r) => r.emoji === emoji);
    if (existing) {
      existing.reactedByMe = !existing.reactedByMe;
      existing.count += existing.reactedByMe ? 1 : -1;
    } else {
      moment.reactions.push({ emoji, count: 1, reactedByMe: true });
    }
  }

  async commentOnMoment(momentId: string, text: string): Promise<void> {
    await delay(200);
    const moment = this.moments.find((m) => m.id === momentId);
    if (!moment) return;
    moment.comments.push({
      id: String(Date.now()),
      authorId: 'me',
      authorName: MOCK_PROFILE.displayName,
      authorAvatarUri: MOCK_PROFILE.avatarUri,
      text,
      createdAt: new Date().toISOString(),
    });
  }

  async listCircleMembers(): Promise<CircleMember[]> {
    await delay();
    return MOCK_CIRCLE_MEMBERS;
  }

  async listCircleMoments(): Promise<CircleMoment[]> {
    await delay();
    return MOCK_CIRCLE_MOMENTS;
  }

  async getProfile(_userId?: string): Promise<UserProfile> {
    await delay(200);
    return MOCK_PROFILE;
  }

  async updateProfile(data: Partial<OnboardingData>): Promise<UserProfile> {
    await delay(300);
    return { ...MOCK_PROFILE, ...data };
  }

  async signInWithEmail(_email: string, _password: string): Promise<{ userId: string }> {
    await delay(600);
    return { userId: 'me' };
  }

  async signUpWithEmail(_email: string, _password: string): Promise<{ userId: string }> {
    await delay(800);
    return { userId: 'me' };
  }

  async signOut(): Promise<void> {
    await delay(200);
  }

  async completeOnboarding(_data: OnboardingData): Promise<UserProfile> {
    await delay(500);
    return MOCK_PROFILE;
  }

  async getTodaySpark(): Promise<SparkDelivery | null> {
    await delay(300);
    const today = new Date().toISOString().split('T')[0];
    const existing = this.sparkDeliveries.find(
      (d) =>
        d.deliveredAt.startsWith(today) &&
        (d.status === 'pending' || d.status === 'accepted')
    );
    if (existing) return existing;

    // Deliver a new spark — pick one not recently seen
    const recentIds = this.sparkDeliveries.map((d) => d.sparkId);
    const eligible = SPARK_LIBRARY.filter((s) => !recentIds.includes(s.id));
    const pool = eligible.length > 0 ? eligible : SPARK_LIBRARY;
    const spark = pool[Math.floor(Math.random() * pool.length)];

    const delivery: SparkDelivery = {
      id: `delivery-${Date.now()}`,
      sparkId: spark.id,
      spark,
      userId: 'me',
      status: 'pending',
      deliveredAt: new Date().toISOString(),
      recommendationReason: 'A little nudge to create something meaningful',
    };
    this.sparkDeliveries.unshift(delivery);
    return delivery;
  }

  async acceptSpark(deliveryId: string): Promise<void> {
    await delay(150);
    const d = this.sparkDeliveries.find((x) => x.id === deliveryId);
    if (d) {
      d.status = 'accepted';
      d.acceptedAt = new Date().toISOString();
    }
  }

  async dismissSpark(deliveryId: string): Promise<void> {
    await delay(150);
    const d = this.sparkDeliveries.find((x) => x.id === deliveryId);
    if (d) d.status = 'dismissed';
  }

  async completeSpark(deliveryId: string, momentId?: string): Promise<void> {
    await delay(200);
    const d = this.sparkDeliveries.find((x) => x.id === deliveryId);
    if (d) {
      d.status = 'completed';
      d.completedAt = new Date().toISOString();
      if (momentId) d.resultMomentId = momentId;
    }
  }

  async getSparkHistory(limit = 20): Promise<SparkDelivery[]> {
    await delay(300);
    return this.sparkDeliveries.slice(0, limit);
  }

  async getSparkSettings(): Promise<SparkSettings> {
    await delay(200);
    return { ...this.sparkSettings };
  }

  async updateSparkSettings(settings: Partial<SparkSettings>): Promise<SparkSettings> {
    await delay(300);
    this.sparkSettings = { ...this.sparkSettings, ...settings };
    return { ...this.sparkSettings };
  }

  async listConversations(): Promise<Conversation[]> {
    await delay(300);
    return MOCK_CONVERSATIONS;
  }

  async getConversation(id: string): Promise<Conversation | null> {
    await delay(200);
    const convo = MOCK_CONVERSATIONS.find((c) => c.id === id) ?? null;
    if (!convo) return null;
    return { ...convo, messages: MOCK_MESSAGES_BY_CONVO[id] ?? [] };
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    await delay(200);
    const msg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'me',
      senderName: 'Me',
      type: 'text',
      text,
      sentAt: new Date().toISOString(),
      isFromMe: true,
    };
    if (!MOCK_MESSAGES_BY_CONVO[conversationId]) {
      MOCK_MESSAGES_BY_CONVO[conversationId] = [];
    }
    MOCK_MESSAGES_BY_CONVO[conversationId].push(msg);
    return msg;
  }

  async markConversationRead(_conversationId: string): Promise<void> { /* no-op in mock */ }

  async listCalendarEvents(): Promise<CalendarEvent[]> {
    await delay(300);
    return MOCK_CALENDAR_EVENTS;
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    await delay(300);
    const q = query.toLowerCase();
    return MOCK_CIRCLE_MEMBERS
      .filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          (m.username && m.username.toLowerCase().includes(q))
      )
      .map((m) => ({
        id: m.id,
        displayName: m.displayName,
        username: m.username ?? m.id,
        avatarUri: m.avatarUri,
        defaultPrivacy: 'close_circle' as const,
        momentCount: 0,
        daysRemembered: 0,
        peopleCount: 0,
        topMoods: [],
        createdAt: new Date().toISOString(),
      }));
  }

  async addToCircle(userId: string): Promise<void> {
    await delay(300);
    this.circleIds.add(userId);
  }

  async removeFromCircle(userId: string): Promise<void> {
    await delay(300);
    this.circleIds.delete(userId);
  }

  async sendConnectionRequest(userId: string): Promise<void> {
    await delay(400);
    const member = MOCK_CIRCLE_MEMBERS.find((m) => m.id === userId);
    if (member && !this.connectionRequests.find((r) => r.userId === userId)) {
      this.connectionRequests.push({
        userId,
        displayName: member.displayName,
        avatarUri: member.avatarUri,
        sentAt: new Date().toISOString(),
      });
    }
  }

  async getConnectionRequests(): Promise<Array<{ userId: string; displayName: string; avatarUri?: string; sentAt: string }>> {
    await delay(300);
    return [...this.connectionRequests];
  }

  async acceptConnectionRequest(userId: string): Promise<void> {
    await delay(300);
    this.connectionRequests = this.connectionRequests.filter((r) => r.userId !== userId);
    this.circleIds.add(userId);
  }

  async declineConnectionRequest(userId: string): Promise<void> {
    await delay(300);
    this.connectionRequests = this.connectionRequests.filter((r) => r.userId !== userId);
  }

  async createClique(name: string, memberIds: string[], type: CliqueType = 'custom', emoji?: string): Promise<Clique> {
    await delay(400);
    const now = new Date().toISOString();
    const members: CliqueMember[] = memberIds.map((uid, i) => ({
      id: `cm-${Date.now()}-${i}`,
      userId: uid,
      displayName: MOCK_CIRCLE_MEMBERS.find((m) => m.id === uid)?.displayName ?? uid,
      avatarUri: MOCK_CIRCLE_MEMBERS.find((m) => m.id === uid)?.avatarUri,
      isOwner: i === 0,
      joinedAt: now,
    }));
    const clique: Clique = {
      id: `clique-${Date.now()}`,
      name,
      type,
      emoji,
      ownerId: 'me',
      members,
      memberCount: members.length,
      momentCount: 0,
      createdAt: now,
    };
    this.cliques.push(clique);
    return clique;
  }

  async updateClique(id: string, data: { name?: string; memberIds?: string[]; emoji?: string; type?: CliqueType }): Promise<Clique> {
    await delay(400);
    const idx = this.cliques.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Clique ${id} not found`);
    const existing = this.cliques[idx];
    const now = new Date().toISOString();
    let members = existing.members;
    if (data.memberIds) {
      members = data.memberIds.map((uid, i) => ({
        id: `cm-${Date.now()}-${i}`,
        userId: uid,
        displayName: MOCK_CIRCLE_MEMBERS.find((m) => m.id === uid)?.displayName ?? uid,
        avatarUri: MOCK_CIRCLE_MEMBERS.find((m) => m.id === uid)?.avatarUri,
        isOwner: uid === existing.ownerId,
        joinedAt: existing.members.find((m) => m.userId === uid)?.joinedAt ?? now,
      }));
    }
    const updated: Clique = {
      ...existing,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.emoji !== undefined ? { emoji: data.emoji } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      members,
      memberCount: members.length,
    };
    this.cliques[idx] = updated;
    return updated;
  }

  async deleteClique(id: string): Promise<void> {
    await delay(300);
    this.cliques = this.cliques.filter((c) => c.id !== id);
  }

  async shareMoment(_momentId: string, _toUserId: string, _message?: string): Promise<void> {
    await delay(300);
  }

  async getCalendarInferences(): Promise<CalendarInference[]> {
    await delay(300);
    return [];
  }

  async confirmCalendarInference(inference: CalendarInference): Promise<CalendarEvent> {
    await delay(400);
    return {
      id: `event-${Date.now()}`,
      title: inference.suggestedTitle,
      date: inference.suggestedDate,
      type: inference.inferredType as CalendarEvent['type'],
      emoji: inference.suggestedEmoji,
      personId: inference.involvedPersonIds[0],
      isRecurring: inference.isRecurring,
    };
  }

  async dismissCalendarInference(_momentId: string, _inferredType: string): Promise<void> {
    await delay(200);
  }

  async createCalendarEvent(event: { title: string; date: string; type: string; emoji?: string; personId?: string; isRecurring?: boolean }): Promise<CalendarEvent> {
    await delay(400);
    return {
      id: `event-${Date.now()}`,
      title: event.title,
      date: event.date,
      type: event.type as CalendarEvent['type'],
      emoji: event.emoji,
      personId: event.personId,
      isRecurring: event.isRecurring ?? false,
    };
  }

  async getUserProfile(_userId: string): Promise<UserProfile> {
    await delay(200);
    return MOCK_PROFILE;
  }

  async listCliques(): Promise<Clique[]> {
    await delay(200);
    return [...this.cliques];
  }

  async createConversation(participantIds: string[], cliqueId?: string): Promise<Conversation> {
    await delay(400);
    const members = MOCK_CIRCLE_MEMBERS.filter((m) => participantIds.includes(m.id));
    const now = new Date().toISOString();
    const convo: Conversation = {
      id: `convo-${Date.now()}`,
      type: cliqueId ? 'group' : participantIds.length > 1 ? 'group' : 'direct',
      participants: [
        { userId: 'me', displayName: MOCK_PROFILE.displayName, avatarUri: MOCK_PROFILE.avatarUri },
        ...members.map((m) => ({ userId: m.id, displayName: m.displayName, avatarUri: m.avatarUri })),
      ],
      participantIds: ['me', ...participantIds],
      participantNames: [MOCK_PROFILE.displayName, ...members.map((m) => m.displayName)],
      participantAvatarUris: [MOCK_PROFILE.avatarUri ?? '', ...members.map((m) => m.avatarUri ?? '')],
      unreadCount: 0,
      cliqueId,
      messages: [],
      lastMessageAt: now,
    };
    return convo;
  }

  async listNotifications(): Promise<Notification[]> {
    await delay(300);
    const now = new Date().toISOString();
    return [
      {
        id: 'notif-1',
        userId: 'me',
        type: 'reaction',
        title: 'Sofia reacted to your moment',
        body: 'Sofia reacted ❤️ to your moment',
        createdAt: now,
      },
      {
        id: 'notif-2',
        userId: 'me',
        type: 'comment',
        title: 'Jamie commented on your moment',
        body: 'Jamie: "This looks amazing!"',
        createdAt: now,
      },
      {
        id: 'notif-3',
        userId: 'me',
        type: 'spark',
        title: 'You have a new Spark',
        body: 'A new spark is ready for you today',
        createdAt: now,
      },
    ];
  }

  async markNotificationRead(_notificationId: string): Promise<void> {
    await delay(100);
  }

  async savePushToken(_token: string): Promise<void> {
    await delay(100);
  }

  async deleteAccount(): Promise<void> {
    await delay(500);
  }

  private _resurfacingRules = { enabled: true, hiddenPersonIds: [] as string[], hiddenPlaceNames: [] as string[] };

  async getResurfacingRules() {
    await delay(200);
    return { ...this._resurfacingRules };
  }

  async updateResurfacingRules(rules: { enabled: boolean; hiddenPersonIds: string[]; hiddenPlaceNames: string[] }): Promise<void> {
    await delay(300);
    this._resurfacingRules = { ...rules };
  }

  async reportContent(_params: { momentId?: string; userId?: string; reason: string; details?: string }): Promise<void> {
    await delay(300);
  }
}
