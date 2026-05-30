import api from "../config/api";

import type { ApiResponse } from "../types/ApiResponse";
import type { UserResponse, UserUpdateRequest } from "../types/UserType";

export const getAllUsers = async () => {
  const res = await api.get<ApiResponse<UserResponse[]>>("/users");

  return res.data;
};

export const getUserById = async (id: number) => {
  const res = await api.get<ApiResponse<UserResponse>>(`/users/${id}`);

  return res.data;
};

/**
 * PUT /users/{id} — multipart/form-data
 * - part `request`: file JSON (application/json)
 * - part `file`: ảnh (chỉ gửi khi user chọn ảnh mới)
 */
export const updateUser = async (
  id: number,
  request: UserUpdateRequest,
  file?: File | null,
) => {
  const formData = new FormData();

  const requestPart = new File(
    [JSON.stringify(request)],
    "request.json",
    { type: "application/json" },
  );
  formData.append("request", requestPart);

  if (file) {
    formData.append("file", file);
  }

  const res = await api.put<ApiResponse<UserResponse>>(`/users/${id}`, formData, {
    // Không set Content-Type — axios tự gắn boundary cho multipart
    transformRequest: [(data) => data],
  });

  return res.data;
};

export const deleteUser = async (id: number) => {
  const res = await api.delete<ApiResponse<void>>(`/users/${id}`);

  return res.data;
};
