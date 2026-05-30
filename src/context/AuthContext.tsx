import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getStoredUser,
  loginApi,
  logoutApi,
  type AuthResult,
  type LoginRequest,
} from "../services/AuthService";
import type { UserResponse } from "../types/UserType";

type AuthContextValue = {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (data: LoginRequest) => Promise<AuthResult>;
  logout: () => Promise<void>;
  setUser: (user: UserResponse | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => getStoredUser());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setIsReady(true);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const result = await loginApi(data);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user?.id,
      isReady,
      login,
      logout,
      setUser,
    }),
    [user, isReady, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
