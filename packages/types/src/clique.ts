export type CliqueType =
  | 'family'
  | 'besties'
  | 'couple'
  | 'siblings'
  | 'parents'
  | 'trip_group'
  | 'coworkers'
  | 'custom';

export interface CliqueMember {
  id: string;
  userId: string;
  displayName: string;
  avatarUri?: string;
  relationship?: string;
  isOwner: boolean;
  joinedAt: string;
  hasNewMoment?: boolean;
}

export interface Clique {
  id: string;
  name: string;
  type: CliqueType;
  emoji?: string;
  coverImageUri?: string;
  ownerId: string;
  members: CliqueMember[];
  memberCount: number;
  momentCount: number;
  activeSparks?: number;
  lastActivityAt?: string;
  createdAt: string;
}

// Legacy alias for backward compat
export interface CircleMember {
  id: string;
  userId: string;
  displayName: string;
  avatarUri?: string;
  relationship?: string;
  hasNewMoment?: boolean;
}

export interface CircleMoment {
  momentId: string;
  authorId: string;
  authorName: string;
  authorAvatarUri?: string;
  imageUri: string;
  thumbnailUri?: string;
  caption?: string;
  createdAt: string;
}
