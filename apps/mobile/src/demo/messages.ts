import type { Conversation, Message } from '@momeants/types';

const CONVO_AVA = 'convo-ava';
const CONVO_FAMILY = 'convo-family';
const CONVO_CREW = 'convo-crew';

export const DEMO_MESSAGES: Record<string, Message[]> = {
  [CONVO_AVA]: [
    { id: 'm1', conversationId: CONVO_AVA, senderId: 'u5', senderName: 'Ava Chen', senderAvatarUri: 'https://i.pravatar.cc/150?u=ava', type: 'text', text: 'Did you see those sunset photos I took on the hike?', sentAt: '2024-11-14T09:12:00Z', isFromMe: false },
    { id: 'm2', conversationId: CONVO_AVA, senderId: 'me', senderName: 'Jordan', type: 'text', text: 'Yes!! The light was unreal 😍', sentAt: '2024-11-14T09:14:00Z', isFromMe: true },
    { id: 'm3', conversationId: CONVO_AVA, senderId: 'u5', senderName: 'Ava Chen', senderAvatarUri: 'https://i.pravatar.cc/150?u=ava', type: 'text', text: 'We should do a Spark — "photo challenge: golden hour"', sentAt: '2024-11-14T09:15:00Z', isFromMe: false },
    { id: 'm4', conversationId: CONVO_AVA, senderId: 'me', senderName: 'Jordan', type: 'text', text: 'Yes let\'s do it this weekend', sentAt: '2024-11-14T09:16:00Z', isFromMe: true },
    { id: 'm5', conversationId: CONVO_AVA, senderId: 'u5', senderName: 'Ava Chen', senderAvatarUri: 'https://i.pravatar.cc/150?u=ava', type: 'moment', text: 'Shared a memory', momentId: '1', sentAt: '2024-11-14T09:18:00Z', isFromMe: false },
  ],
  [CONVO_FAMILY]: [
    { id: 'f1', conversationId: CONVO_FAMILY, senderId: 'u2', senderName: 'Mom', senderAvatarUri: 'https://i.pravatar.cc/150?u=mom', type: 'text', text: 'I found the most beautiful photo of our camping trip from 2018 🏕️', sentAt: '2024-11-13T18:30:00Z', isFromMe: false },
    { id: 'f2', conversationId: CONVO_FAMILY, senderId: 'u3', senderName: 'Dad', senderAvatarUri: 'https://i.pravatar.cc/150?u=dad', type: 'text', text: 'That was such a great trip. The stars that night...', sentAt: '2024-11-13T18:32:00Z', isFromMe: false },
    { id: 'f3', conversationId: CONVO_FAMILY, senderId: 'me', senderName: 'Jordan', type: 'text', text: 'I still have all those photos! Let me capture them in Momeants', sentAt: '2024-11-13T18:35:00Z', isFromMe: true },
    { id: 'f4', conversationId: CONVO_FAMILY, senderId: 'u4', senderName: 'Sam', senderAvatarUri: 'https://i.pravatar.cc/150?u=sam', type: 'text', text: 'Mom you look the same as you do now 😂', sentAt: '2024-11-13T18:40:00Z', isFromMe: false },
    { id: 'f5', conversationId: CONVO_FAMILY, senderId: 'u2', senderName: 'Mom', senderAvatarUri: 'https://i.pravatar.cc/150?u=mom', type: 'reaction', reactionEmoji: '😂', sentAt: '2024-11-13T18:41:00Z', isFromMe: false },
  ],
  [CONVO_CREW]: [
    { id: 'cr1', conversationId: CONVO_CREW, senderId: 'u6', senderName: 'Noah', senderAvatarUri: 'https://i.pravatar.cc/150?u=noah', type: 'text', text: 'Okay who\'s hosting game night next Friday?', sentAt: '2024-11-14T10:00:00Z', isFromMe: false },
    { id: 'cr2', conversationId: CONVO_CREW, senderId: 'u7', senderName: 'Mia', senderAvatarUri: 'https://i.pravatar.cc/150?u=mia', type: 'text', text: 'I can! I got a new place remember 🏠', sentAt: '2024-11-14T10:02:00Z', isFromMe: false },
    { id: 'cr3', conversationId: CONVO_CREW, senderId: 'me', senderName: 'Jordan', type: 'text', text: 'Perfect. I\'ll bring snacks', sentAt: '2024-11-14T10:04:00Z', isFromMe: true },
    { id: 'cr4', conversationId: CONVO_CREW, senderId: 'u5', senderName: 'Ava', senderAvatarUri: 'https://i.pravatar.cc/150?u=ava', type: 'spark', text: 'Started a Spark: This or That — Movie Edition', sparkId: 'spark-1', sentAt: '2024-11-14T10:05:00Z', isFromMe: false },
  ],
};

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: CONVO_AVA,
    participantIds: ['me', 'u5'],
    participantNames: ['Jordan', 'Ava Chen'],
    participantAvatarUris: ['', 'https://i.pravatar.cc/150?u=ava'],
    lastMessage: 'Shared a memory',
    lastMessageAt: '2024-11-14T09:18:00Z',
    lastMessageSenderId: 'u5',
    unreadCount: 1,
  },
  {
    id: CONVO_FAMILY,
    participantIds: ['me', 'u2', 'u3', 'u4'],
    participantNames: ['Jordan', 'Mom', 'Dad', 'Sam'],
    participantAvatarUris: ['', 'https://i.pravatar.cc/150?u=mom', 'https://i.pravatar.cc/150?u=dad', 'https://i.pravatar.cc/150?u=sam'],
    lastMessage: '😂',
    lastMessageAt: '2024-11-13T18:41:00Z',
    lastMessageSenderId: 'u2',
    unreadCount: 0,
    cliqueId: 'clique-family',
    cliqueName: 'Ellis Family',
  },
  {
    id: CONVO_CREW,
    participantIds: ['me', 'u5', 'u6', 'u7'],
    participantNames: ['Jordan', 'Ava', 'Noah', 'Mia'],
    lastMessage: 'Ava started a Spark',
    lastMessageAt: '2024-11-14T10:05:00Z',
    lastMessageSenderId: 'u5',
    unreadCount: 2,
    cliqueId: 'clique-besties',
    cliqueName: 'The Crew',
  },
];
