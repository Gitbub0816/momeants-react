// Auto-generate this with: supabase gen types typescript --project-id <id>
// This is a hand-written approximation until you run the CLI generator.
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

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
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
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
        Insert: Omit<Database['public']['Tables']['moments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['moments']['Insert']>;
      };
      moment_moods: {
        Row: { moment_id: string; mood: string; sort_order: number };
        Insert: Database['public']['Tables']['moment_moods']['Row'];
        Update: Partial<Database['public']['Tables']['moment_moods']['Row']>;
      };
      moment_people: {
        Row: { moment_id: string; profile_id: string | null; name_label: string };
        Insert: Database['public']['Tables']['moment_people']['Row'];
        Update: Partial<Database['public']['Tables']['moment_people']['Row']>;
      };
      moment_locations: {
        Row: { moment_id: string; label: string; city: string | null; country: string | null; lat: number | null; lng: number | null };
        Insert: Database['public']['Tables']['moment_locations']['Row'];
        Update: Partial<Database['public']['Tables']['moment_locations']['Row']>;
      };
      circle_members: {
        Row: { owner_id: string; member_id: string; relationship: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['circle_members']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['circle_members']['Insert']>;
      };
      reactions: {
        Row: { id: string; moment_id: string; user_id: string; emoji: string; created_at: string };
        Insert: Omit<Database['public']['Tables']['reactions']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      comments: {
        Row: { id: string; moment_id: string; author_id: string; text: string; created_at: string };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      notifications: {
        Row: { id: string; user_id: string; type: string; title: string; body: string; payload: Json; read_at: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Pick<Database['public']['Tables']['notifications']['Row'], 'read_at'>;
      };
      resurfacing_rules: {
        Row: { user_id: string; hide_people_ids: string[]; hide_place_labels: string[]; hide_date_ranges: Json; updated_at: string };
        Insert: Database['public']['Tables']['resurfacing_rules']['Row'];
        Update: Partial<Database['public']['Tables']['resurfacing_rules']['Row']>;
      };
      push_tokens: {
        Row: { id: string; user_id: string; token: string; created_at: string };
        Insert: Omit<Database['public']['Tables']['push_tokens']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      connection_requests: {
        Row: { id: string; from_user_id: string; to_user_id: string; status: 'pending' | 'accepted' | 'declined'; created_at: string };
        Insert: Omit<Database['public']['Tables']['connection_requests']['Row'], 'id' | 'created_at'>;
        Update: Pick<Database['public']['Tables']['connection_requests']['Row'], 'status'>;
      };
      moment_shares: {
        Row: { id: string; moment_id: string; from_user_id: string; to_user_id: string; message: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['moment_shares']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      calendar_events: {
        Row: { id: string; user_id: string; title: string; date: string; type: string; emoji: string | null; person_id: string | null; person_name: string | null; clique_name: string | null; moment_id: string | null; is_recurring: boolean; description: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['calendar_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['calendar_events']['Insert']>;
      };
      cliques: {
        Row: { id: string; name: string; type: string; emoji: string | null; owner_id: string; moment_count: number; created_at: string };
        Insert: Omit<Database['public']['Tables']['cliques']['Row'], 'id' | 'created_at' | 'moment_count'>;
        Update: Partial<Database['public']['Tables']['cliques']['Insert']>;
      };
      clique_members: {
        Row: { clique_id: string; user_id: string; joined_at: string };
        Insert: Omit<Database['public']['Tables']['clique_members']['Row'], 'joined_at'>;
        Update: never;
      };
      conversations: {
        Row: { id: string; type: string; name: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Pick<Database['public']['Tables']['conversations']['Row'], 'updated_at'>;
      };
      conversation_participants: {
        Row: { conversation_id: string; user_id: string; joined_at: string };
        Insert: Omit<Database['public']['Tables']['conversation_participants']['Row'], 'joined_at'>;
        Update: never;
      };
      messages: {
        Row: { id: string; conversation_id: string; sender_id: string; text: string; sent_at: string };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'sent_at'>;
        Update: never;
      };
      spark_deliveries: {
        Row: { id: string; user_id: string; spark_id: string; status: string; delivered_at: string; accepted_at: string | null; completed_at: string | null; result_moment_id: string | null; recommendation_reason: string | null };
        Insert: Omit<Database['public']['Tables']['spark_deliveries']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['spark_deliveries']['Row']>;
      };
      spark_library: {
        Row: { id: string; title: string; description: string; body: string; category: string; game_type: string; estimated_minutes: number; min_players: number; max_players: number; requires_photo: boolean; requires_conversation: boolean; requires_location: boolean; holiday: string | null; season: string | null; relationship_types: string[]; memory_potential: number; conversation_score: number; emotional_weight: number; novelty_score: number; completion_cta: string; prompts: string[] | null; tags: string[] };
        Insert: Database['public']['Tables']['spark_library']['Row'];
        Update: Partial<Database['public']['Tables']['spark_library']['Row']>;
      };
      spark_settings: {
        Row: { user_id: string; enabled: boolean; frequency_per_week: number; quiet_hours_start: string; quiet_hours_end: string; enabled_categories: string[]; allow_location: boolean; allow_weather: boolean; allow_holidays: boolean; allow_relationship: boolean; allow_ai_personalization: boolean; background_engagement_sparks_enabled: boolean; minigame_sparks_enabled: boolean };
        Insert: Database['public']['Tables']['spark_settings']['Row'];
        Update: Partial<Database['public']['Tables']['spark_settings']['Row']>;
      };
    };
    Functions: {
      get_home_feed: { Args: { viewer: string; lim?: number }; Returns: MomentDetailRow[] };
      get_timeline: { Args: { viewer: string; yr?: number; mo?: number }; Returns: MomentDetailRow[] };
      get_resurfaced_moments: { Args: { viewer: string }; Returns: MomentDetailRow[] };
      toggle_reaction: { Args: { p_moment_id: string; p_emoji: string }; Returns: void };
      username_available: { Args: { uname: string }; Returns: boolean };
      get_today_spark: { Args: { p_user_id: string }; Returns: any[] };
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
