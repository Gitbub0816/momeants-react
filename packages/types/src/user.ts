export type PrivacyLevel = 'private' | 'close_circle' | 'selected_people';

export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  tagline?: string;
  avatarUri?: string;
  city?: string;
  country?: string;
  defaultPrivacy: PrivacyLevel;
  momentCount: number;
  daysRemembered: number;
  peopleCount: number;
  topMoods: string[];
  createdAt: string;
}

export interface OnboardingData {
  fullName: string;
  birthday: string;
  username: string;
  avatarUri?: string;
  city?: string;
  country?: string;
  defaultPrivacy: PrivacyLevel;
  allowNotifications: boolean;
}

export interface AuthState {
  userId: string | null;
  isOnboarded: boolean;
  isLoading: boolean;
}
