import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  Loader2,
  MessageCircleMore,
  Search,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { createConversation } from "../services/ConversationService";
import { addMembers } from "../services/ConversationMemberService";
import {
  getNotificationsByUserId,
  markAsRead,
} from "../services/NotificationService";
import { getAllUsers } from "../services/UserService";
import { useThemeStore } from "../store/ThemeStore";
import type { NotificationResponse } from "../types/NotificationType";
import type { UserResponse } from "../types/UserType";
import { getAvatarUrl } from "../utils/avatar";
import { formatRelativeTime } from "../utils/format";
import ThemeToggle from "./ThemeToggle";
import AvatarMenu from "./AvatarMenu";

const Header = () => {
  const { isDark } = useThemeStore();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [keyword, setKeyword] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const [creatingChatFor, setCreatingChatFor] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await getAllUsers();
      setUsers((res.result ?? []).filter((u) => u.id !== currentUser?.id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser?.id]);

  const loadNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await getNotificationsByUserId(currentUser.id);
      setNotifications(res.result ?? []);
    } catch (error) {
      console.error(error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadUsers();
    loadNotifications();
  }, [loadUsers, loadNotifications]);

  const filteredUsers = users.filter((user) => {
    if (!keyword.trim()) return false;
    const q = keyword.toLowerCase();
    const name = (user.fullName ?? user.username).toLowerCase();
    return name.includes(q) || user.username.toLowerCase().includes(q);
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const startPrivateChat = async (otherUser: UserResponse) => {
    if (!currentUser) return;

    setCreatingChatFor(otherUser.id);

    try {
      const res = await createConversation({
        name: `${currentUser.username} & ${otherUser.username}`,
        type: "PRIVATE",
        createdBy: currentUser.id,
      });

      const conversationId = res.result?.id;
      if (!conversationId) throw new Error("Create failed");

      await addMembers(conversationId, currentUser.id, [
        currentUser.id,
        otherUser.id,
      ]);

      setKeyword("");
      setShowResult(false);
      window.dispatchEvent(new CustomEvent("chat-list-refresh"));
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      alert("Không thể tạo cuộc trò chuyện");
    } finally {
      setCreatingChatFor(null);
    }
  };

  const handleReadNotification = async (notif: NotificationResponse) => {
    if (notif.isRead) return;
    try {
      await markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header
      className={`
        h-16 px-4 md:px-6 flex items-center justify-between border-b shrink-0 z-50
        backdrop-blur-xl sticky top-0
        ${
          isDark
            ? "bg-gray-900/90 border-gray-800"
            : "bg-white/90 border-gray-200/80"
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-fit">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
          <MessageCircleMore className="text-white" size={20} />
        </div>
        <div className="hidden sm:block">
          <h1
            className={`text-lg font-bold tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Yuki Chat
          </h1>
          <p
            className={`text-xs ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Xin chào, {currentUser?.fullName ?? currentUser?.username ?? "bạn"}
          </p>
        </div>
      </div>

      <div className="flex-1 flex justify-center px-2 md:px-6 max-w-xl">
        <div className="relative w-full">
          <div
            className={`
              h-10 rounded-xl flex items-center gap-2 px-3 border transition
              ${
                isDark
                  ? "bg-gray-800/80 border-gray-700 focus-within:border-blue-500"
                  : "bg-gray-50 border-gray-200 focus-within:border-blue-400 shadow-sm"
              }
            `}
          >
            <Search
              size={17}
              className={isDark ? "text-gray-500" : "text-gray-400"}
            />
            <input
              type="text"
              placeholder="Tìm người dùng..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => setShowResult(true)}
              onBlur={() => setTimeout(() => setShowResult(false), 200)}
              className={`flex-1 bg-transparent outline-none text-sm ${
                isDark
                  ? "text-white placeholder:text-gray-500"
                  : "text-gray-900 placeholder:text-gray-500"
              }`}
            />
          </div>

          {showResult && keyword.trim() && (
            <div
              className={`
                absolute top-12 left-0 w-full rounded-2xl overflow-hidden
                shadow-2xl border z-50 max-h-80 overflow-y-auto
                ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
              `}
            >
              {loadingUsers ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-blue-500" size={22} />
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const label = user.fullName || user.username;
                  const isCreating = creatingChatFor === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`px-4 py-3 flex items-center justify-between gap-3 ${
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={getAvatarUrl(label, user.avatarUrl)}
                            alt={label}
                            className="w-11 h-11 rounded-full object-cover"
                          />
                          {user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3
                            className={`font-semibold truncate text-sm ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {label}
                          </h3>
                          <p
                            className={`text-xs truncate ${
                              isDark ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      <button
                        disabled={isCreating}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => startPrivateChat(user)}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 text-xs font-medium disabled:opacity-60 shrink-0"
                      >
                        {isCreating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserPlus size={14} />
                        )}
                        Nhắn tin
                      </button>
                    </div>
                  );
                })
              ) : (
                <p
                  className={`px-4 py-4 text-sm ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Không tìm thấy người dùng
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <div className="relative">
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              if (!showNotif) loadNotifications();
            }}
            className={`
              relative w-10 h-10 rounded-xl flex items-center justify-center transition
              ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }
            `}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotif(false)}
              />
              <div
                className={`
                  absolute right-0 top-12 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden
                  ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
                `}
              >
                <div
                  className={`px-4 py-3 border-b font-semibold text-sm ${
                    isDark ? "border-gray-700 text-white" : "border-gray-100"
                  }`}
                >
                  Thông báo
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p
                      className={`px-4 py-6 text-sm text-center ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Không có thông báo
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleReadNotification(notif)}
                        className={`
                          w-full text-left px-4 py-3 border-b transition
                          ${!notif.isRead ? (isDark ? "bg-blue-500/10" : "bg-blue-50") : ""}
                          ${isDark ? "border-gray-800 hover:bg-gray-800" : "border-gray-50 hover:bg-gray-50"}
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {notif.title}
                          </p>
                          {notif.isRead && (
                            <Check size={14} className="text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 line-clamp-2 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {notif.content}
                        </p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isDark ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {formatRelativeTime(notif.createdAt)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <ThemeToggle />
        <AvatarMenu />
      </div>
    </header>
  );
};

export default Header;
