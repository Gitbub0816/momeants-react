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
} from '@momeants/types';
import type { Database, MomentDetailRow } from './database.types';

type SB = SupabaseClient<Database>;

// ─── ROW → DOMAIN MAPPERS ────────────────────────────────────────────────────

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

  async updateProfile(data: Partial<OnboardingData>): Promise<UserProfile> {
    const { data: session } = await this.sb.auth.getSession();
    const userId = session.session!.user.id;

    await this.sb.from('profiles').update({
      ...(data.fullName && { display_name: data.fullName }),
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
