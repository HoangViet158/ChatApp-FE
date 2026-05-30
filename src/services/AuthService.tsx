import api from "../config/api";
import type { UserResponse } from "../types/UserType";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  username: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  user: UserResponse;
}

const USER_STORAGE_KEY = "user";

export const getStoredUser = (): UserResponse | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
};

export const loginApi = async (data: LoginRequest) => {
  const res = await api.post("/auth/login", data);
  

  const result = res.data.result as AuthResult;

  if (!result?.accessToken || !result?.user?.id) {
    throw new Error("Invalid login response");
  }

  localStorage.setItem("accessToken", result.accessToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));

  return result;
};

export const registerApi = async (data: RegisterRequest) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};
export const logoutApi = async () => {
  await api.post("/auth/logout", {});
  localStorage.removeItem("accessToken");
  localStorage.removeItem(USER_STORAGE_KEY);
};
