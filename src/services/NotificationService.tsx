import api from "../config/api";

import type { ApiResponse } from "../types/ApiResponse";
import type {
  NotificationRequest,
  NotificationResponse,
} from "../types/NotificationType";

// CREATE
export const createNotification = async (data: NotificationRequest) => {
  const response = await api.post<ApiResponse<NotificationResponse>>(
    "/notifications",
    data,
  );

  return response.data;
};

// GET BY ID
export const getNotificationById = async (id: number) => {
  const response = await api.get<ApiResponse<NotificationResponse>>(
    `/notifications/${id}`,
  );

  return response.data;
};

// GET ALL
export const getAllNotifications = async () => {
  const response =
    await api.get<ApiResponse<NotificationResponse[]>>("/notifications");

  return response.data;
};

// GET BY USER ID
export const getNotificationsByUserId = async (userId: number) => {
  const response = await api.get<ApiResponse<NotificationResponse[]>>(
    `/notifications/user/${userId}`,
  );

  return response.data;
};

// UPDATE
export const updateNotification = async (
  id: number,
  data: NotificationRequest,
) => {
  const response = await api.put<ApiResponse<NotificationResponse>>(
    `/notifications/${id}`,
    data,
  );

  return response.data;
};

// MARK AS READ
export const markAsRead = async (id: number) => {
  const response = await api.put<ApiResponse<NotificationResponse>>(
    `/notifications/${id}/read`,
  );

  return response.data;
};

// MARK ALL AS READ
export const markAllAsRead = async (userId: number) => {
  const response = await api.put<ApiResponse<void>>(
    `/notifications/user/${userId}/read-all`,
  );

  return response.data;
};

// DELETE
export const deleteNotification = async (id: number) => {
  const response = await api.delete<ApiResponse<void>>(`/notifications/${id}`);

  return response.data;
};
