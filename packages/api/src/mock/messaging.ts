import type { Conversation, Message, CalendarEvent } from '@momeants/types';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    type: 'direct',
    participantIds: ['me', 'u2'],
    participantNames: ['Me', 'Ava Chen'],
    participants: [{ userId: 'u2', displayName: 'Ava Chen' }],
    lastMessage: { text: 'Did you see that sunset photo I posted?', senderName: 'Ava Chen', sentAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), isFromMe: false },
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    lastMessageSenderId: 'u2',
    unreadCount: 2,
  },
  {
    id: 'c2',
    type: 'group',
    participantIds: ['me', 'u1', 'u3', 'u4'],
    participantNames: ['Me', 'Jordan', 'Noah', 'Mia'],
    participants: [{ userId: 'u1', displayName: 'Jordan' }, { userId: 'u3', displayName: 'Noah' }, { userId: 'u4', displayName: 'Mia' }],
    lastMessage: { text: 'Game night this Saturday?', senderName: 'Jordan', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), isFromMe: false },
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    lastMessageSenderId: 'u1',
    unreadCount: 0,
    cliqueName: 'The Crew',
  },
  {
    id: 'c3',
    type: 'direct',
    participantIds: ['me', 'u5'],
    participantNames: ['Me', 'Alex Rivera'],
    participants: [{ userId: 'u5', displayName: 'Alex Rivera' }],
    lastMessage: { text: 'Happy to share that spark with you!', senderName: 'Me', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), isFromMe: true },
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastMessageSenderId: 'me',
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES_BY_CONVO: Record<string, Message[]> = {
  c1: [
    { id: 'm1', conversationId: 'c1', senderId: 'me', senderName: 'Me', type: 'text', text: 'Hey! How was your day?', sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isFromMe: true },
    { id: 'm2', conversationId: 'c1', senderId: 'u2', senderName: 'Ava Chen', type: 'text', text: 'So good! Just got back from the farmers market ☀️', sentAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), isFromMe: false },
    { id: 'm3', conversationId: 'c1', senderId: 'u2', senderName: 'Ava Chen', type: 'moment', text: 'Look at these flowers I found!', sentAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), isFromMe: false },
    { id: 'm4', conversationId: 'c1', senderId: 'u2', senderName: 'Ava Chen', type: 'text', text: 'Did you see that sunset photo I posted?', sentAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), isFromMe: false },
  ],
  c2: [
    { id: 'm5', conversationId: 'c2', senderId: 'u3', senderName: 'Noah', type: 'text', text: 'Anyone free this week?', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), isFromMe: false },
    { id: 'm6', conversationId: 'c2', senderId: 'u4', senderName: 'Mia', type: 'text', text: "I'm free Thursday!", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(), isFromMe: false },
    { id: 'm7', conversationId: 'c2', senderId: 'me', senderName: 'Me', type: 'text', text: 'Same — Thursday works', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3.2).toISOString(), isFromMe: true },
    { id: 'm8', conversationId: 'c2', senderId: 'u1', senderName: 'Jordan', type: 'text', text: 'Game night this Saturday?', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), isFromMe: false },
  ],
  c3: [
    { id: 'm9', conversationId: 'c3', senderId: 'u5', senderName: 'Alex Rivera', type: 'spark', text: 'Just did this spark — you should try it!', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), isFromMe: false },
    { id: 'm10', conversationId: 'c3', senderId: 'me', senderName: 'Me', type: 'text', text: 'Happy to share that spark with you!', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), isFromMe: true },
  ],
};

const THIS_YEAR = new Date().getFullYear();

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'e1', type: 'birthday', title: "Mom's Birthday", emoji: '🎂', date: `${THIS_YEAR}-12-03`, isRecurring: true, personName: 'Mom' },
  { id: 'e2', type: 'anniversary', title: 'Our Anniversary', emoji: '❤️', date: `${THIS_YEAR}-11-22`, isRecurring: true, personName: 'Partner' },
  { id: 'e3', type: 'memory_anniversary', title: 'Road trip to Big Sur', emoji: '🌊', date: `${THIS_YEAR}-11-20`, isRecurring: true, description: '2 years ago today' },
  { id: 'e4', type: 'birthday', title: "Jordan's Birthday", emoji: '🎉', date: `${THIS_YEAR}-12-15`, isRecurring: true, personName: 'Jordan Ellis' },
  { id: 'e5', type: 'holiday', title: 'Thanksgiving', emoji: '🦃', date: `${THIS_YEAR}-11-28`, isRecurring: true },
  { id: 'e6', type: 'clique_event', title: 'Ellis Family Dinner', emoji: '🍽️', date: `${THIS_YEAR}-11-30`, isRecurring: false, cliqueName: 'Ellis Family' },
  { id: 'e7', type: 'holiday', title: 'Christmas', emoji: '🎄', date: `${THIS_YEAR}-12-25`, isRecurring: true },
  { id: 'e8', type: 'memory_anniversary', title: 'First day at this apartment', emoji: '🏠', date: `${THIS_YEAR}-12-01`, isRecurring: true, description: '1 year ago' },
];
