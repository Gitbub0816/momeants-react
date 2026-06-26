// Auto-generate this with: supabase gen types typescript --project-id <id>
// This is a hand-written approximation until you run the CLI generator.
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type NoRelationships = { Relationships: never[] };

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          username: string;
          tagline: string | null;
          avatar_url: string | null;
          city: string | null;
          country: string | null;
          default_privacy: 'private' | 'close_circle' | 'selected_people';
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          username: string;
          tagline?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          default_privacy: 'private' | 'close_circle' | 'selected_people';
          onboarded_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string;
          username?: string;
          tagline?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          default_privacy?: 'private' | 'close_circle' | 'selected_people';
          onboarded_at?: string | null;
        };
      } & NoRelationships;
      moments: {
        Row: {
          id: string;
          author_id: string;
          image_url: string;
          thumbnail_url: string | null;
          caption: string | null;
          visibility: 'private' | 'close_circle' | 'selected_people';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          image_url: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          visibility: 'private' | 'close_circle' | 'selected_people';
        };
        Update: {
          image_url?: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          visibility?: 'private' | 'close_circle' | 'selected_people';
        };
      } & NoRelationships;
      moment_moods: {
        Row: { moment_id: string; mood: string; sort_order: number };
        Insert: { moment_id: string; mood: string; sort_order: number };
        Update: { moment_id?: string; mood?: string; sort_order?: number };
      } & NoRelationships;
      moment_people: {
        Row: { moment_id: string; profile_id: string | null; name_label: string };
        Insert: { moment_id: string; profile_id?: string | null; name_label: string };
        Update: { profile_id?: string | null; name_label?: string };
      } & NoRelationships;
      moment_locations: {
        Row: { moment_id: string; label: string; city: string | null; country: string | null; lat: number | null; lng: number | null };
        Insert: { moment_id: string; label: string; city?: string | null; country?: string | null; lat?: number | null; lng?: number | null };
        Update: { label?: string; city?: string | null; country?: string | null; lat?: number | null; lng?: number | null };
      } & NoRelationships;
      circle_members: {
        Row: { owner_id: string; member_id: string; relationship: string | null; created_at: string };
        Insert: { owner_id: string; member_id: string; relationship?: string | null };
        Update: { relationship?: string | null };
      } & NoRelationships;
      reactions: {
        Row: { id: string; moment_id: string; user_id: string; emoji: string; created_at: string };
        Insert: { moment_id: string; user_id: string; emoji: string };
        Update: never;
      } & NoRelationships;
      comments: {
        Row: { id: string; moment_id: string; author_id: string; text: string; created_at: string };
        Insert: { moment_id: string; author_id: string; text: string };
        Update: never;
      } & NoRelationships;
      notifications: {
        Row: { id: string; user_id: string; type: string; title: string; body: string; payload: Json; read_at: string | null; created_at: string };
        Insert: { user_id: string; type: string; title: string; body: string; payload?: Json; read_at?: string | null };
        Update: { read_at?: string | null };
      } & NoRelationships;
      resurfacing_rules: {
        Row: { user_id: string; hide_people_ids: string[]; hide_place_labels: string[]; hide_date_ranges: Json; updated_at: string };
        Insert: { user_id: string; hide_people_ids?: string[]; hide_place_labels?: string[]; hide_date_ranges?: Json; updated_at?: string };
        Update: { hide_people_ids?: string[]; hide_place_labels?: string[]; hide_date_ranges?: Json; updated_at?: string };
      } & NoRelationships;
      push_tokens: {
        Row: { id: string; user_id: string; token: string; created_at: string };
        Insert: { user_id: string; token: string };
        Update: never;
      } & NoRelationships;
      connection_requests: {
        Row: { id: string; from_user_id: string; to_user_id: string; status: 'pending' | 'accepted' | 'declined'; created_at: string };
        Insert: { from_user_id: string; to_user_id: string; status?: 'pending' | 'accepted' | 'declined' };
        Update: { status?: 'pending' | 'accepted' | 'declined' };
      } & NoRelationships;
      moment_shares: {
        Row: { id: string; moment_id: string; from_user_id: string; to_user_id: string; message: string | null; created_at: string };
        Insert: { moment_id: string; from_user_id: string; to_user_id: string; message?: string | null };
        Update: never;
      } & NoRelationships;
      calendar_events: {
        Row: { id: string; user_id: string; title: string; date: string; type: string; emoji: string | null; person_id: string | null; person_name: string | null; clique_name: string | null; moment_id: string | null; is_recurring: boolean; description: string | null; created_at: string };
        Insert: { user_id: string; title: string; date: string; type: string; emoji?: string | null; person_id?: string | null; person_name?: string | null; clique_name?: string | null; moment_id?: string | null; is_recurring?: boolean; description?: string | null };
        Update: { title?: string; date?: string; type?: string; emoji?: string | null; person_id?: string | null; person_name?: string | null; clique_name?: string | null; moment_id?: string | null; is_recurring?: boolean; description?: string | null };
      } & NoRelationships;
      cliques: {
        Row: { id: string; name: string; type: string; emoji: string | null; owner_id: string; moment_count: number; created_at: string };
        Insert: { name: string; type: string; emoji?: string | null; owner_id: string };
        Update: { name?: string; type?: string; emoji?: string | null };
      } & NoRelationships;
      clique_members: {
        Row: { clique_id: string; user_id: string; joined_at: string };
        Insert: { clique_id: string; user_id: string };
        Update: never;
      } & NoRelationships;
      conversations: {
        Row: { id: string; type: string; name: string | null; created_at: string; updated_at: string };
        Insert: { type: string; name?: string | null };
        Update: { updated_at?: string };
      } & NoRelationships;
      conversation_participants: {
        Row: { conversation_id: string; user_id: string; joined_at: string };
        Insert: { conversation_id: string; user_id: string };
        Update: never;
      } & NoRelationships;
      messages: {
        Row: { id: string; conversation_id: string; sender_id: string; text: string; sent_at: string };
        Insert: { conversation_id: string; sender_id: string; text: string };
        Update: never;
      } & NoRelationships;
      spark_deliveries: {
        Row: { id: string; user_id: string; spark_id: string; status: string; delivered_at: string; accepted_at: string | null; completed_at: string | null; result_moment_id: string | null; recommendation_reason: string | null };
        Insert: { user_id: string; spark_id: string; status: string; delivered_at: string; accepted_at?: string | null; completed_at?: string | null; result_moment_id?: string | null; recommendation_reason?: string | null };
        Update: { status?: string; accepted_at?: string | null; completed_at?: string | null; result_moment_id?: string | null };
      } & NoRelationships;
      spark_library: {
        Row: { id: string; title: string; description: string; body: string; category: string; game_type: string; mode: string; estimated_minutes: number; min_players: number; max_players: number; requires_photo: boolean; requires_conversation: boolean; requires_location: boolean; holiday: string | null; season: string | null; relationship_types: string[]; memory_potential: number; conversation_score: number; emotional_weight: number; novelty_score: number; completion_cta: string; prompts: string[] | null; tags: string[] };
        Insert: { id: string; title: string; description: string; body: string; category: string; game_type: string; mode: string; estimated_minutes: number; min_players: number; max_players: number; requires_photo: boolean; requires_conversation: boolean; requires_location: boolean; holiday?: string | null; season?: string | null; relationship_types: string[]; memory_potential: number; conversation_score: number; emotional_weight: number; novelty_score: number; completion_cta: string; prompts?: string[] | null; tags: string[] };
        Update: { title?: string; description?: string; body?: string; category?: string; game_type?: string; mode?: string; estimated_minutes?: number };
      } & NoRelationships;
      spark_settings: {
        Row: { user_id: string; enabled: boolean; frequency_per_week: number; quiet_hours_start: string; quiet_hours_end: string; enabled_categories: string[]; allow_location: boolean; allow_weather: boolean; allow_holidays: boolean; allow_relationship: boolean; allow_ai_personalization: boolean; background_engagement_sparks_enabled: boolean; minigame_sparks_enabled: boolean };
        Insert: { user_id: string; enabled?: boolean; frequency_per_week?: number; quiet_hours_start?: string; quiet_hours_end?: string; enabled_categories?: string[]; allow_location?: boolean; allow_weather?: boolean; allow_holidays?: boolean; allow_relationship?: boolean; allow_ai_personalization?: boolean; background_engagement_sparks_enabled?: boolean; minigame_sparks_enabled?: boolean };
        Update: { enabled?: boolean; frequency_per_week?: number; quiet_hours_start?: string; quiet_hours_end?: string; enabled_categories?: string[]; allow_location?: boolean; allow_weather?: boolean; allow_holidays?: boolean; allow_relationship?: boolean; allow_ai_personalization?: boolean; background_engagement_sparks_enabled?: boolean; minigame_sparks_enabled?: boolean };
      } & NoRelationships;
    };
    Views: Record<string, never>;
    Functions: {
      get_home_feed: { Args: { viewer: string; lim?: number }; Returns: unknown };
      get_timeline: { Args: { viewer: string; yr?: number | null; mo?: number | null }; Returns: unknown };
      get_resurfaced_moments: { Args: { viewer: string }; Returns: unknown };
      toggle_reaction: { Args: { p_moment_id: string; p_emoji: string }; Returns: unknown };
      username_available: { Args: { uname: string }; Returns: boolean };
      get_today_spark: { Args: { p_user_id: string }; Returns: unknown };
    };
  };
}

export interface MomentDetailRow {
  id: string;
  author_id: string;
  image_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  visibility: 'private' | 'close_circle' | 'selected_people';
  created_at: string;
  updated_at: string;
  author_name: string;
  author_username: string;
  author_avatar_url: string | null;
  moods: string[];
  people: Array<{ name: string; profileId: string | null }>;
  location: { label: string; city: string | null; country: string | null; lat: number | null; lng: number | null } | null;
  reaction_counts: Record<string, number>;
}
