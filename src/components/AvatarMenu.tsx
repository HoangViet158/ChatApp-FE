import { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getUserById, updateUser } from "../services/UserService";
import { useThemeStore } from "../store/ThemeStore";
import type { UserResponse } from "../types/UserType";
import { getAvatarUrl } from "../utils/avatar";
import ProfileModalUpdate, {
  type ProfileSaveData,
} from "./ProfileModalUpdate";

const AvatarMenu = () => {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const { user: storedUser, logout, setUser: setAuthUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(storedUser);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!storedUser?.id) return;
    setLoading(true);
    try {
      const res = await getUserById(storedUser.id);
      if (res.result) {
        setUser(res.result);
        setAuthUser(res.result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [storedUser?.id, setAuthUser]);

  useEffect(() => {
    if (storedUser) setUser(storedUser);
  }, [storedUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      navigate("/auth", { replace: true });
    }
  };

  const handleSaveProfile = async ({ form, avatarFile }: ProfileSaveData) => {
    if (!user?.id) return;

    if (!form.password.trim()) {
      alert("Nhập mật khẩu hiện tại để lưu thay đổi");
      return;
    }

    setSaving(true);

    try {
      const res = await updateUser(
        user.id,
        {
          username: form.username,
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          bio: form.bio,
        },
        avatarFile,
      );

      if (res.result) {
        setUser(res.result);
        setAuthUser(res.result);
        setOpenProfile(false);
      }
    } catch (error: unknown) {
      console.error(error);
      const msg =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String((error.response.data as { message: string }).message)
          : "Cập nhật thất bại. Kiểm tra mật khẩu và file ảnh.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.fullName || user?.username || "User";
  const avatar = getAvatarUrl(displayName, user?.avatarUrl);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-full ring-2 ring-blue-500/40 hover:ring-blue-500 transition"
      >
        {loading ? (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Loader2 size={18} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <img
            src={avatar}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        {user?.isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className={`
              absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl overflow-hidden z-50
              ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
            `}
          >
            <div
              className={`px-4 py-3 border-b ${
                isDark ? "border-gray-800" : "border-gray-100"
              }`}
            >
              <p
                className={`font-semibold text-sm truncate ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {displayName}
              </p>
              <p
                className={`text-xs truncate ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setOpenProfile(true);
              }}
              className={`w-full px-4 py-3 flex gap-2 text-sm ${
                isDark
                  ? "text-gray-200 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <User size={17} />
              Hồ sơ
            </button>

            <button
              type="button"
              className={`w-full px-4 py-3 flex gap-2 text-sm ${
                isDark
                  ? "text-gray-200 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Settings size={17} />
              Cài đặt
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className={`w-full px-4 py-3 flex gap-2 text-sm text-red-500 ${
                isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
              }`}
            >
              <LogOut size={17} />
              Đăng xuất
            </button>
          </div>
        </>
      )}

      {user && (
        <ProfileModalUpdate
          open={openProfile}
          onClose={() => !saving && setOpenProfile(false)}
          isDark={isDark}
          currentAvatarUrl={user.avatarUrl}
          user={{
            fullName: user.fullName ?? "",
            username: user.username,
            email: user.email,
            bio: user.bio ?? "",
            password: "",
          }}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
};

export default AvatarMenu;
