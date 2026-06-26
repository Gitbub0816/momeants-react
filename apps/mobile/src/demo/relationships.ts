import type { RelationshipWeight } from '../engines/types';

export const DEMO_RELATIONSHIP_WEIGHTS: RelationshipWeight[] = [
  {
    userId: 'me',
    targetId: 'user-maya',
    manualWeight: 1.0,
    relationshipType: 'bestie',
    sharedMomentCount: 18,
    messageFrequency: 7,
    sparkParticipationCount: 6,
    commentReplyCount: 12,
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
  },
  {
    userId: 'me',
    targetId: 'user-dad',
    manualWeight: 0.9,
    relationshipType: 'family',
    sharedMomentCount: 24,
    messageFrequency: 3,
    sparkParticipationCount: 2,
    commentReplyCount: 8,
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
  },
  {
    userId: 'me',
    targetId: 'user-mom',
    manualWeight: 0.9,
    relationshipType: 'family',
    sharedMomentCount: 30,
    messageFrequency: 5,
    sparkParticipationCount: 3,
    commentReplyCount: 15,
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h ago
  },
  {
    userId: 'me',
    targetId: 'user-jordan',
    manualWeight: 0.75,
    relationshipType: 'close_friend',
    sharedMomentCount: 10,
    messageFrequency: 2,
    sparkParticipationCount: 4,
    commentReplyCount: 7,
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2d ago
  },
  {
    userId: 'me',
    targetId: 'user-alex',
    manualWeight: 0.55,
    relationshipType: 'friend',
    sharedMomentCount: 5,
    messageFrequency: 0.5,
    sparkParticipationCount: 1,
    commentReplyCount: 3,
    lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10d ago
  },
];
