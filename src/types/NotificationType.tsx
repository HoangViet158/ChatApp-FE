export interface NotificationRequest {
  userId: number;
  title: string;
  content: string;
  type: string;
}

export interface NotificationResponse {
  id: number;
  userId: number;
  username?: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
