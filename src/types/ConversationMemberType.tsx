export interface ConversationMemberRequest {
  nickname?: string;
  role?: string;
}

export interface ConversationMemberResponse {
  id: number;
  conversationId: number;
  conversationName?: string;
  userId: number;
  username?: string;
  role?: string;
  lastReadMessageId?: number;
  createdAt?: string;
  updatedAt?: string;
}
