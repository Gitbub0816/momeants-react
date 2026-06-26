export interface Notification {
  id: string;
  userId: string;
  type: 'reaction' | 'comment' | 'connection_request' | 'spark' | 'memory' | 'birthday' | 'clique_invite';
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}
