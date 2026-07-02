import type { SparkCategory } from '@momeants/types';
import { colors } from '@momeants/design';

// Shared visual language for spark categories: an Ionicons name and a
// two-stop gradient used for the glowing pill border accent.
export interface SparkCategoryMeta {
  icon: string;
  accent: string;
  gradient: [string, string];
}

const DEFAULT_META: SparkCategoryMeta = {
  icon: 'sparkles-outline',
  accent: colors.auraPurple,
  gradient: [colors.auraPurple, colors.auraBlue],
};

const META: Record<string, SparkCategoryMeta> = {
  conversation: { icon: 'chatbubble-ellipses-outline', accent: colors.auraBlue, gradient: [colors.auraBlue, colors.auraLavender] },
  memory: { icon: 'sparkles-outline', accent: colors.auraPurple, gradient: [colors.auraPurple, colors.auraPink] },
  relationship: { icon: 'heart-circle-outline', accent: colors.emberRose, gradient: [colors.emberRose, colors.auraPurple] },
  holiday: { icon: 'gift-outline', accent: colors.candleGold, gradient: [colors.candleGold, colors.sunsetPeach] },
  anniversary: { icon: 'heart-outline', accent: colors.emberRose, gradient: [colors.emberRose, colors.auraPink] },
  seasonal: { icon: 'leaf-outline', accent: colors.safe, gradient: [colors.safe, colors.auraBlue] },
  location: { icon: 'location-outline', accent: colors.auraBlue, gradient: [colors.auraBlue, colors.safe] },
  family: { icon: 'home-outline', accent: colors.sunsetPeach, gradient: [colors.sunsetPeach, colors.candleGold] },
  storytelling: { icon: 'book-outline', accent: colors.auraLavender, gradient: [colors.auraLavender, colors.auraBlue] },
  friendship: { icon: 'people-outline', accent: colors.auraBlue, gradient: [colors.auraBlue, colors.auraPurple] },
  couple: { icon: 'heart-half-outline', accent: colors.auraPink, gradient: [colors.auraPink, colors.emberRose] },
  clique: { icon: 'people-circle-outline', accent: colors.auraPurple, gradient: [colors.auraPurple, colors.auraBlue] },
  photo: { icon: 'camera-outline', accent: colors.auraPink, gradient: [colors.auraPink, colors.auraPurple] },
  creative: { icon: 'color-palette-outline', accent: colors.auraLavender, gradient: [colors.auraLavender, colors.auraPink] },
  discovery: { icon: 'compass-outline', accent: colors.safe, gradient: [colors.safe, colors.auraLavender] },
};

export function sparkCategoryMeta(category?: string): SparkCategoryMeta {
  if (!category) return DEFAULT_META;
  return META[category] ?? DEFAULT_META;
}
