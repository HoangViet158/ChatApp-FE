import api from "../config/api";

import type {
  MessageStatusRequest,
  MessageStatusResponse,
} from "../types/MessageStatusType";
import type { ApiResponse } from "../types/ApiResponse";
// CREATE
export const createMessageStatus = async (data: MessageStatusRequest) => {
  const response = await api.post<ApiResponse<MessageStatusResponse>>(
    "/message-status",
    data,
  );

  return response.data;
};

// GET BY ID
export const getMessageStatusById = async (id: number) => {
  const response = await api.get<ApiResponse<MessageStatusResponse>>(
    `/message-status/${id}`,
  );

  return response.data;
};

// GET ALL
export const getAllMessageStatuses = async () => {
  const response =
    await api.get<ApiResponse<MessageStatusResponse[]>>("/message-status");

  return response.data;
};

// UPDATE
export const updateMessageStatus = async (
  id: number,
  data: MessageStatusRequest,
) => {
  const response = await api.put<ApiResponse<MessageStatusResponse>>(
    `/message-status/${id}`,
    data,
  );

  return response.data;
};

// MARK AS SEEN
export const markAsSeen = async (id: number) => {
  const response = await api.put<ApiResponse<MessageStatusResponse>>(
    `/message-status/${id}/seen`,
  );

  return response.data;
};

// DELETE
export const deleteMessageStatus = async (id: number) => {
  const response = await api.delete<ApiResponse<void>>(`/message-status/${id}`);

  return response.data;
};
