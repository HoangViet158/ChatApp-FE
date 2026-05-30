import api from "../config/api";

import type {
  ConversationMemberRequest,
  ConversationMemberResponse,
} from "../types/ConversationMemberType";

import type { ApiResponse } from "../types/ApiResponse";

// ADD MEMBERS
export const addMembers = async (
  conversationId: number,
  creatorId: number,
  userIds: number[],
) => {
  const response = await api.post<ApiResponse<void>>(
    `/conversation-member`,
    userIds,
    {
      params: {
        conversationId,
        creatorId,
      },
    },
  );

  return response.data;
};

// GET BY ID
export const getConversationMemberById = async (id: number) => {
  const response = await api.get<ApiResponse<ConversationMemberResponse>>(
    `/conversation-member/${id}`,
  );

  return response.data;
};

// GET ALL
export const getAllConversationMembers = async () => {
  const response = await api.get<ApiResponse<ConversationMemberResponse[]>>(
    "/conversation-member",
  );

  return response.data;
};

// GET MEMBERS BY CONVERSATION ID
export const getMembersByConversationId = async (conversationId: number) => {
  const response = await api.get<ApiResponse<ConversationMemberResponse[]>>(
    `/conversation-member/conversation/${conversationId}`,
  );

  return response.data;
};

// UPDATE
export const updateConversationMember = async (
  id: number,
  data: ConversationMemberRequest,
) => {
  const response = await api.put<ApiResponse<void>>(
    `/conversation-member/${id}`,
    data,
  );

  return response.data;
};

// DELETE
export const deleteConversationMember = async (id: number) => {
  const response = await api.put<ApiResponse<void>>(
    `/conversation-member/delete/${id}`,
  );

  return response.data;
};

// UPDATE LAST SEEN
export const updateLastSeen = async (id: number, messageId: number) => {
  const response = await api.put<ApiResponse<void>>(
    `/conversation-member/last-seen/${id}`,
    messageId,
  );

  return response.data;
};
