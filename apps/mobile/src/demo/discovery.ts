import type { Moment } from '@momeants/types';

// Second-degree users — friends of p1 (Ava), p2 (Marcus), p3 (Sofia)
// not in the direct circle. Used by outreachEngine for discovery feed slots.
export const MOCK_DISCOVERY_MOMENTS: Moment[] = [
  {
    id: 'disc_1',
    authorId: 'disc_user_1',
    imageUri: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800',
    caption: 'Golden hour at the lake. Nothing better.',
    moods: ['Peaceful', 'Free'],
    visibility: 'close_circle',
    people: [],
    reactions: [
      { emoji: '❤️', count: 12, reactedByMe: false },
      { emoji: '✨', count: 5, reactedByMe: false },
    ],
    comments: [
      { id: 'dc1', authorId: 'p1', authorName: 'Ava Chen', text: 'This is gorgeous!', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'disc_2',
    authorId: 'disc_user_2',
    imageUri: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    caption: 'Three years of friendship. So grateful for these people.',
    moods: ['Grateful', 'Loved'],
    visibility: 'close_circle',
    people: [{ id: 'p2', name: 'Marcus', avatarUri: 'https://i.pravatar.cc/100?img=3' }],
    reactions: [
      { emoji: '❤️', count: 8, reactedByMe: false },
    ],
    comments: [],
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'disc_3',
    authorId: 'disc_user_3',
    imageUri: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
    caption: 'Finally made it to Big Sur. Worth every mile.',
    moods: ['Adventurous', 'Excited'],
    visibility: 'close_circle',
    people: [],
    reactions: [
      { emoji: '🌊', count: 21, reactedByMe: false },
      { emoji: '❤️', count: 9, reactedByMe: false },
    ],
    comments: [
      { id: 'dc2', authorId: 'p3', authorName: 'Sofia Park', text: 'I need to do this trip!', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 'dc3', authorId: 'disc_user_1', authorName: 'Jordan Lee', text: 'The views never get old', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
];

// Social graph: maps userId → Set of connected userIds
// p1 (Ava) knows disc_user_1 and disc_user_2
// p3 (Sofia) knows disc_user_3
export const MOCK_SOCIAL_GRAPH: Map<string, Set<string>> = new Map([
  ['p1', new Set(['p2', 'p3', 'me', 'disc_user_1', 'disc_user_2'])],
  ['p2', new Set(['p1', 'p4', 'me', 'disc_user_2'])],
  ['p3', new Set(['p1', 'p5', 'me', 'disc_user_3'])],
  ['p4', new Set(['p2', 'me'])],
  ['p5', new Set(['p3', 'me'])],
  ['me', new Set(['p1', 'p2', 'p3', 'p4', 'p5'])],
  ['disc_user_1', new Set(['p1'])],
  ['disc_user_2', new Set(['p1', 'p2'])],
  ['disc_user_3', new Set(['p3'])],
]);
