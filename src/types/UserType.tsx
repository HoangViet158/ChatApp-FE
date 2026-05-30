export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  isOnline?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** JSON gửi trong part `request` khi PUT /users/{id} (multipart) */
export interface UserUpdateRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  bio?: string;
}
