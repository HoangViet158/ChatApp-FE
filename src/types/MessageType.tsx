export interface MessageRequest {
  conversationId: number;
  senderId: number;
  content: string;
  messageType?: string;
  replyToMessageId?: number;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  conversationName?: string;
  senderId: number;
  senderName?: string;
  content: string;
  messageType: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  replyToMessageId?: number;
}
