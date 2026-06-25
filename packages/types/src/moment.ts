export type MoodTag =
  | 'Peaceful'
  | 'Grateful'
  | 'Loved'
  | 'Excited'
  | 'Nostalgic'
  | 'Proud'
  | 'Free'
  | 'Cozy'
  | 'Adventurous';

export type MomentVisibility = 'private' | 'close_circle' | 'selected_people';

export interface MomentPerson {
  id: string;
  name: string;
  avatarUri?: string;
}

export interface MomentLocation {
  label: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface MomentReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface MomentComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUri?: string;
  text: string;
  createdAt: string;
}

export interface Moment {
  id: string;
  authorId: string;
  imageUri: string;
  thumbnailUri?: string;
  caption?: string;
  moods: MoodTag[];
  visibility: MomentVisibility;
  people: MomentPerson[];
  location?: MomentLocation;
  musicTitle?: string;
  musicArtist?: string;
  reactions: MomentReaction[];
  comments: MomentComment[];
  createdAt: string;
  updatedAt: string;
  isResurfaced?: boolean;
  resurfaceLabel?: string;
}

export interface CreateMomentInput {
  imageUri: string;
  caption?: string;
  moods: MoodTag[];
  visibility: MomentVisibility;
  people: MomentPerson[];
  location?: MomentLocation;
  musicTitle?: string;
  musicArtist?: string;
}

export interface TimelineGroup {
  dateLabel: string;
  isoDate: string;
  moments: Moment[];
}

export interface TimelineParams {
  year?: number;
  month?: number;
  granularity?: 'day' | 'week' | 'month';
}
