import type { Moment, CircleMember, CircleMoment, Clique, Conversation, SparkDelivery, Spark, CalendarEvent, SponsoredItem } from '@momeants/types';

export interface RelationshipWeight {
  userId: string;
  targetId: string;
  manualWeight: number;
  relationshipType: 'bestie' | 'family' | 'couple' | 'close_friend' | 'friend' | 'acquaintance';
  sharedMomentCount: number;
  messageFrequency: number;
  sparkParticipationCount: number;
  commentReplyCount: number;
  lastInteractionAt: string;
}

// Maps userId -> Set of userIds they follow/are connected to (second-degree graph)
export type SocialGraph = Map<string, Set<string>>;

export interface EngineContext {
  userId: string;
  currentTime: Date;
  moments: Moment[];
  circleMembers: CircleMember[];
  cliques: Clique[];
  circleMoments: CircleMoment[];
  conversations: Conversation[];
  sparkHistory: SparkDelivery[];
  availableSparks: Spark[];
  calendarEvents: CalendarEvent[];
  seenFeedItemIds: Set<string>;
  dismissedSparkIds: Set<string>;
  seenSponsoredIds: Map<string, number>; // adId -> impression count today
  relationshipWeights: RelationshipWeight[];
  socialGraph: SocialGraph;              // second-degree connection map
  sponsoredItems: SponsoredItem[];
  discoveryMoments: Moment[];            // moments from outside direct circle for discovery
  userInterestSignals: string[];         // inferred from moods/captions e.g. ['travel', 'family', 'food']
}
