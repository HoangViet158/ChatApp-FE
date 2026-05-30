export interface ConversationRequest {
  name: string;
  type: string;
  avatarUrl?: string;
  createdBy: number;
}

export interface ConversationResponse {
  id: number;
  name: string;
  type?: string;
  avatarUrl?: string;
  createdBy?: number;
  createdByUsername?: string;
  createdAt: string;
}
