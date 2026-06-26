export type OutreachTier =
  | 'direct_circle'     // user's own circle members
  | 'clique_member'     // shared clique
  | 'friend_of_friend'  // second-degree connection
  | 'organic_discovery' // high-engagement, same-interest signal
  | 'sponsored';        // paid placement

export interface OutreachTarget {
  userId: string;
  tier: OutreachTier;
  socialDistance: 1 | 2 | 3; // hops from author
  relevanceScore: number;     // 0-1
  reason: string;
}

export interface OutreachResult {
  momentId: string;
  targets: OutreachTarget[];
  estimatedReach: number;
  amplificationScore: number; // 0-1, how likely this spreads further
  privacyGate: 'private' | 'close_circle' | 'selected_people' | 'open';
  allowsDiscovery: boolean;   // can second-degree users see this?
}

export interface SponsoredItem {
  id: string;
  advertiserId: string;
  advertiserName: string;
  headline: string;
  subtext?: string;
  imageUri?: string;
  ctaLabel: string;
  ctaUrl: string;
  category: SponsorCategory;
  targetInterests: string[];   // matched against user mood/interest signals
  targetRelationshipTypes?: string[];
  relevanceScore?: number;     // computed at runtime
  impressionCap: number;       // max impressions per user per day
  active: boolean;
}

export type SponsorCategory =
  | 'travel'
  | 'food'
  | 'gifting'
  | 'wellness'
  | 'family'
  | 'photography'
  | 'local_event'
  | 'subscription'
  | 'charity';
