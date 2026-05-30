import api from "../config/api";

import type {
  ConversationRequest,
  ConversationResponse,
} from "../types/ConversationType";

import type { ApiResponse } from "../types/ApiResponse";

// CREATE
export const createConversation = async (data: ConversationRequest) => {
  const response = await api.post<ApiResponse<ConversationResponse>>(
    "/conversations",
    data,
  );

  return response.data;
};

// UPDATE
export const updateConversation = async (
  id: number,
  data: ConversationRequest,
) => {
  const response = await api.put<ApiResponse<ConversationResponse>>(
    `/conversations/${id}`,
    data,
  );

  return response.data;
};

// DELETE
export const deleteConversation = async (id: number, userId: number) => {
  const response = await api.delete<ApiResponse<void>>(`/conversations/${id}`, {
    data: userId,
  });

  return response.data;
};

// SEARCH
export const searchConversations = async (name: string) => {
  const response = await api.get<ApiResponse<ConversationResponse[]>>(
    "/conversations/search",
    {
      params: {
        name,
      },
    },
  );

  return response.data;
};

// GET BY ID
export const getConversationById = async (id: number) => {
  const response = await api.get<ApiResponse<ConversationResponse>>(
    `/conversations/${id}`,
  );

  return response.data;
};

// GET ALL
export const getAllConversations = async () => {
  const response =
    await api.get<ApiResponse<ConversationResponse[]>>("/conversations");

  return response.data;
};

// GET BY USER ID — chỉ conversations mà user tham gia
export const getConversationsByUserId = async (userId: number) => {
  const response = await api.get<ApiResponse<ConversationResponse[]>>(
    `/conversations/user/${userId}`,
  );

  return response.data;
};
