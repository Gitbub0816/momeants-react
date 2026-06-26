import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  MomentsApi,
  Moment,
  MomentReaction,
  MomentComment,
  MomentPerson,
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
  CalendarEvent,
  SparkDelivery,
  SparkSettings,
  Spark,
  Conversation,
  Message,
} from '@momeants/types';
import type { Database, MomentDetailRow } from './database.types';

type SB = SupabaseClient<Database>;

// ─── ROW → DOMAIN MAPPERS ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSpark(r: any): Spark {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    body: r.body,
    category: r.category,
    gameType: r.game_type,
    estimatedMinutes: r.estimated_minutes,
    minPlayers: r.min_players,
    maxPlayers: r.max_players,
    requiresPhoto: r.requires_photo,
    requiresConversation: r.requires_conversation,
    requiresLocation: r.requires_location,
    holiday: r.holiday ?? undefined,
    season: r.season ?? undefined,
    relationshipTypes: r.relationship_types ?? [],
    memoryPotential: r.memory_potential,
    conversationScore: r.conversation_score,
    emotionalWeight: r.emotional_weight,
    noveltyScore: r.novelty_score,
    completionCta: r.completion_cta,
    prompts: r.prompts ?? undefined,
    tags: r.tags ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSparkDelivery(r: any): SparkDelivery {
  return {
    id: r.delivery_id ?? r.id,
    sparkId: r.spark_id,
    spark: rowToSpark(r),
    userId: r.user_id,
    status: r.status,
    deliveredAt: r.delivered_at,
    acceptedAt: r.accepted_at ?? undefined,
    completedAt: r.completed_at ?? undefined,
    resultMomentId: r.result_moment_id ?? undefined,
    recommendationReason: r.recommendation_reason ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSparkDeliveryFromJoin(r: any): SparkDelivery {
  return {
    id: r.id,
    sparkId: r.spark_id,
    spark: rowToSpark(r.spark),
    userId: r.user_id,
    status: r.status,
    deliveredAt: r.delivered_at,
    acceptedAt: r.accepted_at ?? undefined,
    completedAt: r.completed_at ?? undefined,
    resultMomentId: r.result_moment_id ?? undefined,
    recommendationReason: r.recommendation_reason ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToClique(r: any): Clique {
  const members: CliqueMember[] = (r.clique_members ?? []).map((cm: any) => ({
    id: cm.user_id,
    userId: cm.user_id,
    displayName: cm.profiles?.display_name ?? cm.user_id,
    avatarUri: cm.profiles?.avatar_url ?? undefined,
    isOwner: cm.user_id === r.owner_id,
    joinedAt: cm.joined_at ?? new Date().toISOString(),
  }));
  return {
    id: r.id,
    name: r.name,
    type: r.type as CliqueType,
    emoji: r.emoji ?? undefined,
    ownerId: r.owner_id,
    members,
    memberCount: members.length,
    momentCount: r.moment_count ?? 0,
    createdAt: r.created_at,
  };
}

function rowToMoment(row: MomentDetailRow, myReactions: Record<string, boolean> = {}): Moment {
  const reactions: MomentReaction[] = Object.entries(row.reaction_counts).map(
    ([emoji, count]) => ({ emoji, count, reactedByMe: !!myReactions[emoji] })
  );
  return {
    id: row.id,
    authorId: row.author_id,
    imageUri: row.image_url,
    thumbnailUri: row.thumbnail_url ?? undefined,
    caption: row.caption ?? undefined,
    moods: row.moods as Moment['moods'],
    visibility: row.visibility,
    people: (row.people ?? []).map((p) => ({
      id: p.profileId ?? p.name,
      name: p.name,
    })),
    location: row.location
      ? { label: row.location.label, city: row.location.city ?? undefined }
      : undefined,
    reactions,
    comments: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── SUPABASE MOMENTS API ────────────────────────────────────────────────────

export class SupabaseMomentsApi implements MomentsApi {
  constructor(private readonly sb: SB) {}

  private get userId(): string {
    const session = (this.sb as any).auth._session;
    return session?.user?.id ?? '';
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { userId: data.user!.id };
  }

  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await this.sb.auth.signUp({ email, password });
    if (error) throw error;
    return { userId: data.user!.id };
  }

  async signOut() {
    await this.sb.auth.signOut();
  }

  async completeOnboarding(data: OnboardingData): Promise<UserProfile> {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session!.user.id;

    await this.sb.from('profiles').upsert({
      id: userId,
      display_name: data.fullName,
      username: data.username,
      city: data.city,
      country: data.country,
      default_privacy: data.defaultPrivacy,
      avatar_url: data.avatarUri,
      onboarded_at: new Date().toISOString(),
    });

    // Upsert resurfacing rules
    await this.sb.from('resurfacing_rules').upsert({
      user_id: userId,
      hide_people_ids: [],
      hide_place_labels: [],
      hide_date_ranges: [],
    });

    return this.getProfile(userId);
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  async getProfile(userId?: string): Promise<UserProfile> {
    const uid = userId ?? (await this.sb.auth.getSession()).data.session!.user.id;
    const { data, error } = await this.sb
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    if (error) throw error;

    const { count: momentCount } = await this.sb
      .from('moments')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', uid);

    const { count: peopleCount } = await this.sb
      .from('circle_members')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', uid);

    return {
      id: data.id,
      displayName: data.display_name,
      username: data.username,
      tagline: data.tagline ?? undefined,
      avatarUri: data.avatar_url ?? undefined,
      city: data.city ?? undefined,
      country: data.country ?? undefined,
      defaultPrivacy: data.default_privacy,
      momentCount: momentCount ?? 0,
      daysRemembered: momentCount ?? 0,
      peopleCount: peopleCount ?? 0,
      topMoods: [],
      createdAt: data.created_at,
    };
  }

  async updateProfile(data: Partial<OnboardingData> & { displayName?: string }): Promise<UserProfile> {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session!.user.id;

    await this.sb.from('profiles').update({
      ...((data.fullName || data.displayName) && { display_name: data.fullName ?? data.displayName }),
      ...(data.username && { username: data.username }),
      ...(data.city && { city: data.city }),
      ...(data.country && { country: data.country }),
      ...(data.avatarUri && { avatar_url: data.avatarUri }),
      ...(data.defaultPrivacy && { default_privacy: data.defaultPrivacy }),
    }).eq('id', userId);

    return this.getProfile(userId);
  }

  // ── Moments ───────────────────────────────────────────────────────────────

  async createMoment(input: CreateMomentInput): Promise<Moment> {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session!.user.id;

    // Upload image to Supabase Storage
    const imageUrl = await this.uploadImage(input.imageUri, userId);

    const { data: moment, error } = await this.sb
      .from('moments')
      .insert({
        author_id: userId,
        image_url: imageUrl,
        caption: input.caption,
        visibility: input.visibility,
      })
      .select()
      .single();
    if (error) throw error;

    // Insert moods
    if (input.moods.length) {
      await this.sb.from('moment_moods').insert(
        input.moods.map((mood, i) => ({ moment_id: moment.id, mood, sort_order: i }))
      );
    }

    // Insert people
    if (input.people.length) {
      await this.sb.from('moment_people').insert(
        input.people.map((p) => ({
          moment_id: moment.id,
          profile_id: p.id !== p.name ? p.id : null,
          name_label: p.name,
        }))
      );
    }

    // Insert location
    if (input.location) {
      await this.sb.from('moment_locations').insert({
        moment_id: moment.id,
        label: input.location.label,
        city: input.location.city,
        country: input.location.country,
        lat: input.location.lat,
        lng: input.location.lng,
      });
    }

    return this.getMoment(moment.id);
  }

  async getMoment(id: string): Promise<Moment> {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session?.user.id;

    const { data, error } = await this.sb
      .from('moment_detail' as any)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;

    // Fetch comments separately
    const { data: commentRows } = await this.sb
      .from('comments')
      .select('*, profiles(display_name, avatar_url)')
      .eq('moment_id', id)
      .order('created_at', { ascending: true });

    // My reactions for this moment
    const { data: myReactionRows } = userId
      ? await this.sb
          .from('reactions')
          .select('emoji')
          .eq('moment_id', id)
          .eq('user_id', userId)
      : { data: [] };

    const myReactions = Object.fromEntries(
      (myReactionRows ?? []).map((r) => [r.emoji, true])
    );

    const moment = rowToMoment(data as MomentDetailRow, myReactions);

    moment.comments = (commentRows ?? []).map((c: any) => ({
      id: c.id,
      authorId: c.author_id,
      authorName: c.profiles?.display_name ?? 'Unknown',
      authorAvatarUri: c.profiles?.avatar_url ?? undefined,
      text: c.text,
      createdAt: c.created_at,
    }));

    return moment;
  }

  async listHomeMoments() {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session!.user.id;

    const [feedRows, resurfacedRows] = await Promise.all([
      this.sb.rpc('get_home_feed', { viewer: userId, lim: 10 }),
      this.sb.rpc('get_resurfaced_moments', { viewer: userId }),
    ]);

    const feed = (feedRows.data ?? []) as MomentDetailRow[];
    const resurfaced = (resurfacedRows.data ?? [])[0] as MomentDetailRow | undefined;

    const moments = feed.map((r) => rowToMoment(r));
    const resurfacedMoment = resurfaced ? { ...rowToMoment(resurfaced), isResurfaced: true, resurfaceLabel: 'A memory from this day' } : undefined;

    return {
      hero: moments[0],
      recent: moments.slice(1),
      resurfaced: resurfacedMoment,
    };
  }

  async listTimeline(params: TimelineParams): Promise<TimelineGroup[]> {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session!.user.id;

    const { data, error } = await this.sb.rpc('get_timeline', {
      viewer: userId,
      yr: params.year ?? null,
      mo: params.month ?? null,
    });
    if (error) throw error;

    const rows = (data ?? []) as MomentDetailRow[];
    const groups = new Map<string, Moment[]>();

    for (const row of rows) {
      const date = new Date(row.created_at);
      const label = date.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(rowToMoment(row));
    }

    return Array.from(groups.entries()).map(([dateLabel, moments]) => ({
      dateLabel,
      isoDate: moments[0].createdAt,
      moments,
    }));
  }

  async reactToMoment(momentId: string, emoji: string): Promise<void> {
    const { error } = await this.sb.rpc('toggle_reaction', {
      p_moment_id: momentId,
      p_emoji: emoji,
    });
    if (error) throw error;
  }

  async commentOnMoment(momentId: string, text: string): Promise<void> {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session!.user.id;

    const { error } = await this.sb.from('comments').insert({
      moment_id: momentId,
      author_id: userId,
      text,
    });
    if (error) throw error;
  }

  // ── Circle ────────────────────────────────────────────────────────────────

  async listCircleMembers(): Promise<CircleMember[]> {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session!.user.id;

    const { data, error } = await this.sb
      .from('circle_members')
      .select('*, profiles!member_id(id, display_name, username, avatar_url)')
      .eq('owner_id', userId);
    if (error) throw error;

    return (data ?? []).map((row: any) => ({
      id: row.profiles.id,
      displayName: row.profiles.display_name,
      username: row.profiles.username,
      avatarUri: row.profiles.avatar_url ?? undefined,
      relationship: row.relationship ?? undefined,
      hasNewMoment: false,
    }));
  }

  async listCircleMoments(): Promise<CircleMoment[]> {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session!.user.id;

    const { data, error } = await this.sb.rpc('get_home_feed', {
      viewer: userId,
      lim: 20,
    });
    if (error) throw error;

    const rows = (data ?? []) as MomentDetailRow[];
    return rows
      .filter((r) => r.author_id !== userId)
      .map((r) => ({
        momentId: r.id,
        authorId: r.author_id,
        authorName: r.author_name,
        authorAvatarUri: r.author_avatar_url ?? undefined,
        imageUri: r.image_url,
        thumbnailUri: r.thumbnail_url ?? undefined,
        caption: r.caption ?? undefined,
        createdAt: r.created_at,
      }));
  }

  // ── Sparks ────────────────────────────────────────────────────────────────

  async getTodaySpark(): Promise<SparkDelivery | null> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) return null;

    const rows = await this.sb.rpc('get_today_spark', { p_user_id: user.id });
    if (rows.error || !rows.data || rows.data.length === 0) return null;

    const r = rows.data[0];
    return rowToSparkDelivery(r);
  }

  async acceptSpark(deliveryId: string): Promise<void> {
    const { error } = await this.sb
      .from('spark_deliveries')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', deliveryId);
    if (error) throw error;
  }

  async dismissSpark(deliveryId: string): Promise<void> {
    const { error } = await this.sb
      .from('spark_deliveries')
      .update({ status: 'dismissed' })
      .eq('id', deliveryId);
    if (error) throw error;
  }

  async completeSpark(deliveryId: string, momentId?: string): Promise<void> {
    const { error } = await this.sb
      .from('spark_deliveries')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        ...(momentId ? { result_moment_id: momentId } : {}),
      })
      .eq('id', deliveryId);
    if (error) throw error;
  }

  async getSparkHistory(limit = 20): Promise<SparkDelivery[]> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) return [];

    const { data, error } = await this.sb
      .from('spark_deliveries')
      .select(`
        id, spark_id, user_id, status, delivered_at, accepted_at, completed_at,
        result_moment_id, recommendation_reason,
        spark:spark_library (*)
      `)
      .eq('user_id', user.id)
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(rowToSparkDeliveryFromJoin);
  }

  async getSparkSettings(): Promise<SparkSettings> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.sb
      .from('spark_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      // Return defaults
      return {
        userId: user.id,
        enabled: true,
        frequencyPerWeek: 3,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        enabledCategories: ['conversation', 'memory', 'relationship', 'family', 'couple', 'seasonal', 'photo', 'creative', 'discovery'],
        allowLocation: true,
        allowWeather: true,
        allowHolidays: true,
        allowRelationship: true,
        allowAiPersonalization: true,
      };
    }

    return {
      userId: data.user_id,
      enabled: data.enabled,
      frequencyPerWeek: data.frequency_per_week,
      quietHoursStart: data.quiet_hours_start,
      quietHoursEnd: data.quiet_hours_end,
      enabledCategories: data.enabled_categories as SparkSettings['enabledCategories'],
      allowLocation: data.allow_location,
      allowWeather: data.allow_weather,
      allowHolidays: data.allow_holidays,
      allowRelationship: data.allow_relationship,
      allowAiPersonalization: data.allow_ai_personalization,
    };
  }

  async updateSparkSettings(settings: Partial<SparkSettings>): Promise<SparkSettings> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const upsertData = {
      user_id: user.id,
      ...(settings.enabled !== undefined ? { enabled: settings.enabled } : {}),
      ...(settings.frequencyPerWeek !== undefined ? { frequency_per_week: settings.frequencyPerWeek } : {}),
      ...(settings.quietHoursStart !== undefined ? { quiet_hours_start: settings.quietHoursStart } : {}),
      ...(settings.quietHoursEnd !== undefined ? { quiet_hours_end: settings.quietHoursEnd } : {}),
      ...(settings.enabledCategories !== undefined ? { enabled_categories: settings.enabledCategories } : {}),
      ...(settings.allowLocation !== undefined ? { allow_location: settings.allowLocation } : {}),
      ...(settings.allowWeather !== undefined ? { allow_weather: settings.allowWeather } : {}),
      ...(settings.allowHolidays !== undefined ? { allow_holidays: settings.allowHolidays } : {}),
      ...(settings.allowRelationship !== undefined ? { allow_relationship: settings.allowRelationship } : {}),
      ...(settings.allowAiPersonalization !== undefined ? { allow_ai_personalization: settings.allowAiPersonalization } : {}),
    };

    const { error } = await this.sb.from('spark_settings').upsert(upsertData);
    if (error) throw error;

    return this.getSparkSettings();
  }

  // ── User Search ───────────────────────────────────────────────────────────

  async searchUsers(query: string): Promise<UserProfile[]> {
    const q = `%${query}%`;
    const { data, error } = await this.sb
      .from('profiles')
      .select('*')
      .or(`display_name.ilike.${q},username.ilike.${q}`)
      .limit(20);
    if (error) throw error;
    return (data ?? []).map((p: any) => ({
      id: p.id,
      displayName: p.display_name,
      username: p.username,
      avatarUri: p.avatar_url ?? undefined,
      tagline: p.tagline ?? undefined,
      city: p.city ?? undefined,
      country: p.country ?? undefined,
      defaultPrivacy: p.default_privacy,
      momentCount: 0,
      daysRemembered: 0,
      peopleCount: 0,
      topMoods: [],
      createdAt: p.created_at,
    }));
  }

  async addToCircle(userId: string): Promise<void> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await this.sb.from('circle_members').upsert({
      owner_id: user.id,
      member_id: userId,
    });
    if (error) throw error;
  }

  async removeFromCircle(userId: string): Promise<void> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await this.sb
      .from('circle_members')
      .delete()
      .eq('owner_id', user.id)
      .eq('member_id', userId);
    if (error) throw error;
  }

  async sendConnectionRequest(toUserId: string): Promise<void> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await this.sb.from('connection_requests').upsert({
      from_user_id: user.id,
      to_user_id: toUserId,
      status: 'pending',
    });
    if (error) throw error;
  }

  async getConnectionRequests(): Promise<Array<{ userId: string; displayName: string; avatarUri?: string; sentAt: string }>> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) return [];
    const { data, error } = await this.sb
      .from('connection_requests')
      .select('from_user_id, created_at, profiles!from_user_id(display_name, avatar_url)')
      .eq('to_user_id', user.id)
      .eq('status', 'pending');
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      userId: r.from_user_id,
      displayName: r.profiles?.display_name ?? 'Unknown',
      avatarUri: r.profiles?.avatar_url ?? undefined,
      sentAt: r.created_at,
    }));
  }

  async acceptConnectionRequest(fromUserId: string): Promise<void> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    await this.sb
      .from('connection_requests')
      .update({ status: 'accepted' })
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', user.id);
    // Add both directions to circle
    await Promise.all([
      this.sb.from('circle_members').upsert({ owner_id: user.id, member_id: fromUserId }),
      this.sb.from('circle_members').upsert({ owner_id: fromUserId, member_id: user.id }),
    ]);
  }

  async declineConnectionRequest(fromUserId: string): Promise<void> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    await this.sb
      .from('connection_requests')
      .update({ status: 'declined' })
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', user.id);
  }

  // ── Cliques ───────────────────────────────────────────────────────────────

  async createClique(name: string, memberIds: string[], type: CliqueType = 'custom', emoji?: string): Promise<Clique> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data: clique, error } = await this.sb
      .from('cliques')
      .insert({ name, type, emoji, owner_id: user.id })
      .select()
      .single();
    if (error) throw error;
    if (memberIds.length) {
      await this.sb.from('clique_members').insert(
        memberIds.map((uid) => ({ clique_id: clique.id, user_id: uid }))
      );
    }
    return this.getCliqueById(clique.id);
  }

  async updateClique(id: string, data: { name?: string; memberIds?: string[]; emoji?: string; type?: CliqueType }): Promise<Clique> {
    if (data.name || data.emoji || data.type) {
      await this.sb.from('cliques').update({
        ...(data.name ? { name: data.name } : {}),
        ...(data.emoji !== undefined ? { emoji: data.emoji } : {}),
        ...(data.type ? { type: data.type } : {}),
      }).eq('id', id);
    }
    if (data.memberIds) {
      await this.sb.from('clique_members').delete().eq('clique_id', id);
      if (data.memberIds.length) {
        await this.sb.from('clique_members').insert(
          data.memberIds.map((uid) => ({ clique_id: id, user_id: uid }))
        );
      }
    }
    return this.getCliqueById(id);
  }

  async deleteClique(id: string): Promise<void> {
    await this.sb.from('cliques').delete().eq('id', id);
  }

  private async getCliqueById(id: string): Promise<Clique> {
    const { data, error } = await this.sb
      .from('cliques')
      .select('*, clique_members(user_id, profiles(display_name, avatar_url))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return rowToClique(data);
  }

  // ── Sharing ───────────────────────────────────────────────────────────────

  async shareMoment(momentId: string, toUserId: string, message?: string): Promise<void> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await this.sb.from('moment_shares').insert({
      moment_id: momentId,
      from_user_id: user.id,
      to_user_id: toUserId,
      message: message ?? null,
    });
    if (error) throw error;
  }

  // ── Calendar ──────────────────────────────────────────────────────────────

  async listCalendarEvents(): Promise<CalendarEvent[]> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) return [];
    const { data, error } = await this.sb
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((e: any) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      type: e.type,
      emoji: e.emoji ?? undefined,
      personId: e.person_id ?? undefined,
      personName: e.person_name ?? undefined,
      cliqueName: e.clique_name ?? undefined,
      momentId: e.moment_id ?? undefined,
      isRecurring: e.is_recurring ?? false,
      description: e.description ?? undefined,
    }));
  }

  async createCalendarEvent(event: { title: string; date: string; type: string; emoji?: string; personId?: string; isRecurring?: boolean }): Promise<CalendarEvent> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await this.sb
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: event.title,
        date: event.date,
        type: event.type,
        emoji: event.emoji ?? null,
        person_id: event.personId ?? null,
        is_recurring: event.isRecurring ?? false,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      date: data.date,
      type: data.type as CalendarEvent['type'],
      emoji: data.emoji ?? undefined,
      personId: data.person_id ?? undefined,
      isRecurring: data.is_recurring ?? false,
    };
  }

  async getCalendarInferences(): Promise<CalendarInference[]> {
    // Inferences are computed client-side by calendarIntelligenceEngine
    return [];
  }

  async confirmCalendarInference(inference: CalendarInference): Promise<CalendarEvent> {
    return this.createCalendarEvent({
      title: inference.suggestedTitle,
      date: inference.suggestedDate,
      type: inference.inferredType,
      emoji: inference.suggestedEmoji,
      personId: inference.involvedPersonIds[0],
      isRecurring: inference.isRecurring,
    });
  }

  async dismissCalendarInference(_momentId: string, _inferredType: string): Promise<void> {
    // No server state needed; dismissed inferences are filtered client-side
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  async listConversations(): Promise<Conversation[]> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) return [];
    const { data, error } = await this.sb
      .from('conversations')
      .select(`
        id, type, name, created_at, updated_at,
        conversation_participants!inner(user_id),
        messages(id, sender_id, text, sent_at, profiles!sender_id(display_name, avatar_url))
      `)
      .eq('conversation_participants.user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((c: any) => {
      const msgs = (c.messages ?? []).sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
      const last = msgs[0];
      return {
        id: c.id,
        type: c.type ?? 'direct',
        name: c.name ?? undefined,
        participants: [],
        lastMessage: last ? {
          text: last.text,
          senderName: last.profiles?.display_name ?? 'Unknown',
          sentAt: last.sent_at,
          isFromMe: last.sender_id === user.id,
        } : undefined,
        unreadCount: 0,
        messages: [],
      };
    });
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) return null;
    const { data, error } = await this.sb
      .from('conversations')
      .select(`
        id, type, name,
        messages(id, sender_id, text, sent_at, profiles!sender_id(display_name, avatar_url))
      `)
      .eq('id', id)
      .single();
    if (error) return null;
    const messages: Message[] = (data.messages ?? [])
      .sort((a: any, b: any) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime())
      .map((m: any) => ({
        id: m.id,
        conversationId: id,
        senderId: m.sender_id,
        senderName: m.profiles?.display_name ?? 'Unknown',
        senderAvatarUri: m.profiles?.avatar_url ?? undefined,
        type: 'text' as const,
        text: m.text,
        sentAt: m.sent_at,
        isFromMe: m.sender_id === user.id,
      }));
    return {
      id: data.id,
      type: data.type ?? 'direct',
      name: data.name ?? undefined,
      participants: [],
      unreadCount: 0,
      messages,
    };
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await this.sb
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: user.id, text })
      .select()
      .single();
    if (error) throw error;
    // Touch conversation updated_at
    await this.sb.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
    return {
      id: data.id,
      conversationId,
      senderId: user.id,
      senderName: 'Me',
      type: 'text',
      text: data.text,
      sentAt: data.sent_at,
      isFromMe: true,
    };
  }

  // ── Storage ───────────────────────────────────────────────────────────────

  private async uploadImage(localUri: string, userId: string): Promise<string> {
    const ext = localUri.split('.').pop() ?? 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;

    const response = await fetch(localUri);
    const blob = await response.blob();

    const { error } = await this.sb.storage
      .from('moments')
      .upload(path, blob, { contentType: `image/${ext}`, upsert: false });
    if (error) throw error;

    const { data } = this.sb.storage.from('moments').getPublicUrl(path);
    return data.publicUrl;
  }
}
