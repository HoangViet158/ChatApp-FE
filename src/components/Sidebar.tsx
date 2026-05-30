import { useMemo, useState } from "react";
import {
  AlertCircle,
  MessageSquarePlus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useThemeStore } from "../store/ThemeStore";
import type { ChatListItem } from "../hooks/useChatList";
import { formatRelativeTime } from "../utils/format";

type SidebarProps = {
  chatItems: ChatListItem[];
  selectedConversationId: number | null;
  onSelectChat: (item: ChatListItem) => void;
  onCreateClick: () => void;
  currentUserId: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const Sidebar = ({
  chatItems,
  selectedConversationId,
  onSelectChat,
  onCreateClick,
  currentUserId,
  loading = false,
  error,
  onRetry,
}: SidebarProps) => {
  const { isDark } = useThemeStore();
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search.trim()) return chatItems;
    const q = search.toLowerCase();
    return chatItems.filter(
      (item) =>
        item.displayName.toLowerCase().includes(q) ||
        item.lastMessage?.content?.toLowerCase().includes(q),
    );
  }, [chatItems, search]);

  const withMessages = filteredItems.filter((i) => i.lastActivityAt > 0);
  const withoutMessages = filteredItems.filter((i) => i.lastActivityAt === 0);

  const renderChatButton = (item: ChatListItem, dimmed = false) => {
    const isSelected = item.conversationId === selectedConversationId;
    const last = item.lastMessage;
    const preview = last
      ? `${last.senderId === currentUserId ? "Bạn: " : ""}${last.content}`
      : "Chưa có tin nhắn";
    const time = item.lastActivityAt
      ? formatRelativeTime(last?.createdAt)
      : "";

    return (
      <button
        key={`${dimmed ? "idle" : "active"}-${item.kind}-${item.otherUserId ?? item.conversationId}`}
        onClick={() => onSelectChat(item)}
        className={`
          w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all
          ${
            isSelected
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
              : dimmed
                ? isDark
                  ? "hover:bg-gray-800/60 text-white opacity-85"
                  : "hover:bg-gray-50 opacity-85"
                : isDark
                  ? "hover:bg-gray-800/80 text-white"
                  : "hover:bg-gray-50 text-gray-900"
          }
        `}
      >
        <img
          src={item.displayAvatar}
          alt={item.displayName}
          className={`rounded-full object-cover shrink-0 ${
            dimmed ? "w-11 h-11 grayscale-[25%]" : "w-12 h-12"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-semibold truncate ${
                dimmed ? "text-sm" : "text-[15px]"
              }`}
            >
              {item.displayName}
              {item.kind === "group" && (
                <span className="text-xs font-normal opacity-70 ml-1">
                  (nhóm)
                </span>
              )}
            </h3>
            {time && (
              <span
                className={`text-[11px] shrink-0 ${
                  isSelected
                    ? "text-blue-100"
                    : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
              >
                {time}
              </span>
            )}
          </div>
          <p
            className={`text-sm truncate mt-0.5 flex items-center gap-1 ${
              isSelected
                ? "text-blue-100/90"
                : isDark
                  ? "text-gray-400"
                  : "text-gray-500"
            }`}
          >
            {preview}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div
      className={`
        h-full flex flex-col rounded-2xl border overflow-hidden shadow-sm
        ${isDark ? "bg-gray-900/90 border-gray-700/80" : "bg-white border-gray-200/80"}
      `}
    >
      <div
        className={`
          p-4 border-b shrink-0
          ${isDark ? "border-gray-700/80" : "border-gray-100 bg-gradient-to-b from-blue-50/80 to-transparent"}
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className={`text-lg font-bold tracking-tight ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Tin nhắn
            </h2>
            <p
              className={`text-xs mt-0.5 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Cuộc trò chuyện của bạn · sắp xếp theo tin gần nhất
            </p>
          </div>
          <div className="flex gap-1">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                title="Tải lại"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <RefreshCw size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onCreateClick}
              title="Tạo cuộc trò chuyện"
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition active:scale-95"
            >
              <MessageSquarePlus size={20} />
            </button>
          </div>
        </div>

        <div
          className={`
            h-11 rounded-xl flex items-center gap-2 px-3 border transition
            ${
              isDark
                ? "bg-gray-800/80 border-gray-700 focus-within:border-blue-500"
                : "bg-white border-gray-200 focus-within:border-blue-400 shadow-sm"
            }
          `}
        >
          <Search size={17} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm cuộc trò chuyện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm ${
              isDark ? "text-white placeholder:text-gray-500" : "text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
        {error && (
          <div
            className={`mx-1 p-3 rounded-xl flex gap-2 text-sm ${
              isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-600"
            }`}
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`animate-pulse flex gap-3 p-3 rounded-2xl ${
                isDark ? "bg-gray-800/60" : "bg-gray-100"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full shrink-0 ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
              <div className="flex-1 space-y-2 py-1">
                <div
                  className={`h-3 rounded-full w-2/3 ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
                <div
                  className={`h-2.5 rounded-full w-full ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
              </div>
            </div>
          ))}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-4xl mb-3">💬</p>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Chưa có cuộc trò chuyện
            </p>
            <button
              onClick={onCreateClick}
              className="text-sm px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition mt-3"
            >
              Tạo cuộc trò chuyện
            </button>
          </div>
        )}

        {!loading && withMessages.map((item) => renderChatButton(item))}

        {!loading && withoutMessages.length > 0 && withMessages.length > 0 && (
          <p
            className={`text-[11px] font-medium uppercase tracking-wide px-2 pt-3 pb-1 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Chưa nhắn tin
          </p>
        )}

        {!loading && withoutMessages.map((item) => renderChatButton(item, true))}
      </div>
    </div>
  );
};

export default Sidebar;
