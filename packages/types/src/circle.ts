export interface CircleMember {
  id: string;
  displayName: string;
  username: string;
  avatarUri?: string;
  relationship?: string;
  hasNewMoment?: boolean;
  birthday?: string; // ISO date string (YYYY-MM-DD), used for birthday calendar events
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
