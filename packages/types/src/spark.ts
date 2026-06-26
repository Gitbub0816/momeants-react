export type SparkCategory =
  | 'conversation'
  | 'memory'
  | 'relationship'
  | 'holiday'
  | 'anniversary'
  | 'seasonal'
  | 'location'
  | 'family'
  | 'storytelling'
  | 'friendship'
  | 'couple'
  | 'clique'
  | 'photo'
  | 'storytelling'
  | 'creative'
  | 'discovery';

export type SparkMode = 'background_engagement' | 'minigame';

export type SparkGameType =
  | 'this_or_that'
  | 'would_you_rather'
  | 'finish_the_sentence'
  | 'deep_question'
  | 'rapid_fire'
  | 'photo_challenge'
  | 'story_game'
  | 'memory_game'
  | 'conversation'
  | 'prompt'
  | 'group_challenge'
  | 'seasonal'
  | 'never_have_i_ever'
  | 'one_word_story'
  | 'emoji_story'
  | 'guess_the_memory'
  | 'guess_the_year'
  | 'guess_the_place'
  | 'caption_battle'
  | 'family_story'
  | 'clique_challenge'
  | 'bestie_challenge'
  | 'holiday_game'
  | 'important_day_game'
  | 'then_and_now'
  | 'memory_recreation'
  | 'gratitude_round'
  | 'who_said_it'
  | 'memory_draft'
  | 'pet_day'
  | 'food_draft'
  | 'bucket_list_builder';

export type SparkStatus = 'pending' | 'accepted' | 'dismissed' | 'completed' | 'expired';

export interface Spark {
  id: string;
  title: string;
  description: string;
  body: string;
  category: SparkCategory;
  gameType: SparkGameType;
  mode: SparkMode;
  estimatedMinutes: number;
  minPlayers: number;
  maxPlayers: number;
  requiresPhoto: boolean;
  requiresConversation: boolean;
  requiresLocation: boolean;
  holiday?: string;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  relationshipTypes: string[];
  memoryPotential: number;
  conversationScore: number;
  emotionalWeight: number;
  noveltyScore: number;
  completionCta: string;
  prompts?: string[];
  tags: string[];
  supportsMomentCreation?: boolean;
  suitableForBesties?: boolean;
  suitableForCliques?: boolean;
  suitableForSolo?: boolean;
  engagementScore?: number;
  cooldownDays?: number;
  visualIntensity?: 'low' | 'medium' | 'high';
  completionLikelihood?: number;
  active?: boolean;
}

export interface SparkDelivery {
  id: string;
  sparkId: string;
  spark: Spark;
  userId: string;
  status: SparkStatus;
  deliveredAt: string;
  acceptedAt?: string;
  completedAt?: string;
  resultMomentId?: string;
  // Explanation of why this spark was chosen
  recommendationReason?: string;
}

export interface SparkSettings {
  userId: string;
  enabled: boolean;
  frequencyPerWeek: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  enabledCategories: SparkCategory[];
  allowLocation: boolean;
  allowWeather: boolean;
  allowHolidays: boolean;
  allowRelationship: boolean;
  allowAiPersonalization: boolean;
  backgroundEngagementSparksEnabled: boolean;
  minigameSparksEnabled: boolean;
}

export interface SparkParticipation {
  sparkDeliveryId: string;
  participantId: string;
  participantName: string;
  participantAvatarUri?: string;
  response?: string;
  photoUri?: string;
  completedAt?: string;
}
