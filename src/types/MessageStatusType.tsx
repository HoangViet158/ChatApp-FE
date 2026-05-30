export interface MessageStatusRequest {
  messageId: number;
  userId: number;
  status: string;
}

export interface MessageStatusResponse {
  id: number;
  messageId: number;
  userId: number;
  status: string;
  seenAt?: string;
  createdAt: string;
}
