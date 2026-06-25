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
    };
    Functions: {
      get_home_feed: { Args: { viewer: string; lim?: number }; Returns: MomentDetailRow[] };
      get_timeline: { Args: { viewer: string; yr?: number; mo?: number }; Returns: MomentDetailRow[] };
      get_resurfaced_moments: { Args: { viewer: string }; Returns: MomentDetailRow[] };
      toggle_reaction: { Args: { p_moment_id: string; p_emoji: string }; Returns: void };
      username_available: { Args: { uname: string }; Returns: boolean };
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
