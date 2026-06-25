export type MessageType = 'text' | 'moment' | 'spark' | 'reaction';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUri?: string;
  type: MessageType;
  text?: string;
  momentId?: string;
  sparkId?: string;
  reactionEmoji?: string;
  sentAt: string;
  readAt?: string;
  isFromMe: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  participantAvatarUris?: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSenderId?: string;
  unreadCount: number;
  cliqueId?: string;
  cliqueName?: string;
  messages?: Message[];
}
