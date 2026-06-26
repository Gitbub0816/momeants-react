import type { Moment, CircleMember, CircleMoment, Clique, Conversation, SparkDelivery, Spark, CalendarEvent } from '@momeants/types';

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
  relationshipWeights: RelationshipWeight[];
}
