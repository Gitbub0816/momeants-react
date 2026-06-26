import type { Clique } from '@momeants/types';

export const DEMO_CLIQUES: Clique[] = [
  {
    id: 'clique-1',
    name: 'Family',
    type: 'family',
    emoji: '🏠',
    ownerId: 'me',
    members: [
      { id: 'cm-1-1', userId: 'user-1', displayName: 'Mom', isOwner: false, joinedAt: '2024-01-01T00:00:00.000Z' },
      { id: 'cm-1-2', userId: 'user-2', displayName: 'Dad', isOwner: false, joinedAt: '2024-01-01T00:00:00.000Z' },
      { id: 'cm-1-3', userId: 'user-3', displayName: 'Sibling', isOwner: false, joinedAt: '2024-01-01T00:00:00.000Z' },
    ],
    memberCount: 3,
    momentCount: 12,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'clique-2',
    name: 'College Friends',
    type: 'besties',
    emoji: '🎓',
    ownerId: 'me',
    members: [
      { id: 'cm-2-1', userId: 'user-4', displayName: 'Alex', isOwner: false, joinedAt: '2024-02-01T00:00:00.000Z' },
      { id: 'cm-2-2', userId: 'user-5', displayName: 'Jordan', isOwner: false, joinedAt: '2024-02-01T00:00:00.000Z' },
      { id: 'cm-2-3', userId: 'user-6', displayName: 'Sam', isOwner: false, joinedAt: '2024-02-01T00:00:00.000Z' },
    ],
    memberCount: 3,
    momentCount: 8,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'clique-3',
    name: 'Work Crew',
    type: 'coworkers',
    emoji: '💼',
    ownerId: 'me',
    members: [
      { id: 'cm-3-1', userId: 'user-7', displayName: 'Morgan', isOwner: false, joinedAt: '2024-03-01T00:00:00.000Z' },
      { id: 'cm-3-2', userId: 'user-8', displayName: 'Taylor', isOwner: false, joinedAt: '2024-03-01T00:00:00.000Z' },
    ],
    memberCount: 2,
    momentCount: 4,
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  {
    id: 'clique-4',
    name: 'Hiking Buds',
    type: 'custom',
    emoji: '🏔️',
    ownerId: 'me',
    members: [
      { id: 'cm-4-1', userId: 'user-2', displayName: 'Dad', isOwner: false, joinedAt: '2024-04-01T00:00:00.000Z' },
      { id: 'cm-4-2', userId: 'user-5', displayName: 'Jordan', isOwner: false, joinedAt: '2024-04-01T00:00:00.000Z' },
      { id: 'cm-4-3', userId: 'user-9', displayName: 'Casey', isOwner: false, joinedAt: '2024-04-01T00:00:00.000Z' },
    ],
    memberCount: 3,
    momentCount: 6,
    createdAt: '2024-04-01T00:00:00.000Z',
  },
];
