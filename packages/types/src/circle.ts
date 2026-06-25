export interface CircleMember {
  id: string;
  displayName: string;
  username: string;
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
