export const colors = {
  // Base ink
  ink900: '#050711',
  ink850: '#090C18',
  ink800: '#0E1324',
  ink700: '#151B31',

  // Glass surfaces
  glass900: 'rgba(12, 16, 32, 0.72)',
  glass800: 'rgba(22, 28, 50, 0.58)',
  glass700: 'rgba(255, 255, 255, 0.08)',

  // Text
  textPrimary: '#F8F4FF',
  textSecondary: 'rgba(248, 244, 255, 0.72)',
  textMuted: 'rgba(248, 244, 255, 0.48)',

  // Brand glow accents
  auraPurple: '#B57CFF',
  auraPink: '#FF7AC8',
  auraBlue: '#78A7FF',
  auraLavender: '#D8C2FF',

  // Warm emotional accents
  sunsetPeach: '#FFB38A',
  emberRose: '#FF6E91',
  candleGold: '#FFD28A',

  // Semantic
  love: '#FF6E91',
  private: '#9CE6D3',
  safe: '#7BE7C8',
  warning: '#FFD28A',
  danger: '#FF6B7A',

  // Borders
  border: 'rgba(255, 255, 255, 0.13)',
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
} as const;

export const gradients = {
  aura: ['#78A7FF', '#B57CFF', '#FF7AC8'] as string[],
  background: ['#151B31', '#090C18', '#050711'] as string[],
  cardOverlay: ['transparent', 'rgba(5, 7, 17, 0.55)', 'rgba(5, 7, 17, 0.88)'] as string[],
  subtleOverlay: ['transparent', 'rgba(5, 7, 17, 0.72)'] as string[],
} as const;
