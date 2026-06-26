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

export interface ConversationLastMessage {
  text: string;
  senderName: string;
  sentAt: string;
  isFromMe: boolean;
}

export interface Conversation {
  id: string;
  type: string;
  name?: string;
  participantIds: string[];
  participantNames: string[];
  participantAvatarUris?: string[];
  participants: Array<{ userId: string; displayName?: string; avatarUri?: string }>;
  lastMessage?: ConversationLastMessage;
  lastMessageAt?: string;
  lastMessageSenderId?: string;
  unreadCount: number;
  cliqueId?: string;
  cliqueName?: string;
  messages?: Message[];
}
