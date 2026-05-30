import api from "../config/api";

import type { MessageRequest, MessageResponse } from "../types/MessageType";
import type { ApiResponse } from "../types/ApiResponse";

// CREATE
export const createMessage = async (data: MessageRequest) => {
  const response = await api.post<ApiResponse<MessageResponse>>(
    "/messages",
    data,
  );

  return response.data;
};

// UPDATE
export const updateMessage = async (id: number, data: MessageRequest) => {
  const response = await api.put<ApiResponse<MessageResponse>>(
    `/messages/${id}`,
    data,
  );

  return response.data;
};

// GET BY ID
export const getMessageById = async (id: number) => {
  const response = await api.get<ApiResponse<MessageResponse>>(
    `/messages/${id}`,
  );

  return response.data;
};

// GET ALL
export const getAllMessages = async () => {
  const response = await api.get<ApiResponse<MessageResponse[]>>("/messages");

  return response.data;
};

// GET BY CONVERSATION ID
export const getMessagesByConversationId = async (conversationId: number) => {
  const response = await api.get<ApiResponse<MessageResponse[]>>(
    `/messages/conversation/${conversationId}`,
  );

  return response.data;
};

// DELETE
export const deleteMessage = async (id: number, userId: number) => {
  const response = await api.delete<ApiResponse<void>>(`/messages/${id}`, {
    data: userId,
  });

  return response.data;
};
